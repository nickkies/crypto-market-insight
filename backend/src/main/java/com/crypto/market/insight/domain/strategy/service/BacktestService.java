package com.crypto.market.insight.domain.strategy.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import com.crypto.market.insight.domain.strategy.dto.BacktestDto;
import com.crypto.market.insight.domain.strategy.engine.BacktestConfig;
import com.crypto.market.insight.domain.strategy.engine.BacktestEngine;
import com.crypto.market.insight.domain.strategy.engine.BacktestOutput;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator;
import com.crypto.market.insight.domain.strategy.model.entity.BacktestResult;
import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.model.vo.StrategyType;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import com.crypto.market.insight.domain.strategy.repository.BacktestResultRepository;
import com.crypto.market.insight.domain.strategy.signal.BollingerBandsSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.MacdSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.MovingAverageCrossoverSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.RsiSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.SignalGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BacktestService {

    private final BacktestEngine backtestEngine;
    private final IndicatorCalculator indicatorCalculator;
    private final BacktestResultRepository backtestResultRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public BacktestDto.Response runBacktest(
            BacktestDto.Request request,
            Long userId,
            List<OhlcvData> rawCandles,
            Timeframe timeframe
    ) {
        // 1. 파라미터 검증
        validateParameters(request);

        // 2. 날짜 계산
        LocalDate endDate = request.getEffectiveEndDate();
        LocalDate startDate = endDate.minusDays(timeframe.getBacktestPeriod());

        // 3. OHLCV 데이터 (Facade에서 전달받음)
        List<OhlcvData> candles = rawCandles;

        // 4. 시간순 정렬 (CoinGecko는 보통 시간순이지만 확실히 하기 위해)
        candles = candles.stream()
                .sorted((a, b) -> Long.compare(a.timestamp(), b.timestamp()))
                .toList();

        // 5. 날짜 범위 필터링 (지표 계산을 위해 시작일 전 데이터도 일부 포함)
        long endTimestamp = endDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        candles = candles.stream()
                .filter(c -> c.timestamp() < endTimestamp)
                .toList();

        log.info("Backtest data: coinId={}, timeframe={}, rawCandles={}, startDate={}, endDate={}",
                request.getCoinId(), request.getTimeframe(), candles.size(), startDate, endDate);

        // 6. Timeframe에 따라 캔들 집계
        // - 1d: 4시간봉 그대로 사용 (더 많은 데이터 포인트 = 더 많은 거래 기회)
        // - 3d/1w: 먼저 일봉으로 집계 후 타임프레임에 맞게 추가 집계
        if (timeframe.getAggregateDays() > 1) {
            candles = aggregateToDailyCandles(candles);
            candles = aggregateCandles(candles, timeframe.getAggregateDays());
        }

        if (candles.size() < request.getRequiredPeriod() + 2) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_DATA);
        }

        // 7. 전략별 지표 계산 및 시그널 생성기 생성
        List<BigDecimal> indicatorValues = calculateIndicatorValues(candles, request);
        SignalGenerator signalGenerator = createSignalGenerator(request);

        // 디버그: 지표 값 분석
        long nonNullCount = indicatorValues.stream().filter(v -> v != null).count();
        log.info("Backtest indicators: strategy={}, totalCandles={}, nonNullIndicators={}",
                request.getStrategyType(), candles.size(), nonNullCount);

        // 8. 백테스트 실행
        BacktestOutput output = backtestEngine.run(
                candles,
                indicatorValues,
                signalGenerator,
                BacktestConfig.defaultConfig()
        );

        log.info("Backtest result: strategy={}, trades={}, cumulativeReturn={}%",
                request.getStrategyType(), output.trades().size(),
                output.metrics().cumulativeReturn());

        // 9. 차트 데이터 생성
        BacktestDto.ChartDataDto chartData = buildChartData(candles, request);

        // 10. 인증된 사용자만 DB 저장 (익명은 저장 안 함)
        if (userId != null) {
            BacktestResult entity = saveBacktestResult(request, output.metrics(), userId, startDate, endDate);
            return buildResponse(entity, output, request, chartData, startDate, endDate);
        }

        // 11. 익명 사용자는 응답만 반환 (저장 안 함)
        return buildAnonymousResponse(request, output, chartData, startDate, endDate);
    }

    private List<BigDecimal> calculateIndicatorValues(List<OhlcvData> candles, BacktestDto.Request request) {
        return switch (request.getStrategyType()) {
            case RSI -> {
                var params = request.getRsiParams();
                yield indicatorCalculator.calculateRsi(candles, params.getPeriod());
            }
            case MACD -> {
                var params = request.getMacdParams();
                var macdResult = indicatorCalculator.calculateMacd(
                        candles,
                        params.getFastPeriod(),
                        params.getSlowPeriod(),
                        params.getSignalPeriod()
                );
                yield macdResult.histogram();
            }
            case BOLLINGER_BANDS -> {
                var params = request.getBollingerBandsParams();
                yield indicatorCalculator.calculatePercentB(
                        candles,
                        params.getPeriod(),
                        params.getStdDev()
                );
            }
            case MOVING_AVERAGE -> {
                var params = request.getMovingAverageParams();
                yield indicatorCalculator.calculateMaDiff(
                        candles,
                        params.getShortPeriod(),
                        params.getLongPeriod()
                );
            }
        };
    }

    private SignalGenerator createSignalGenerator(BacktestDto.Request request) {
        return switch (request.getStrategyType()) {
            case RSI -> {
                var params = request.getRsiParams();
                yield new RsiSignalGenerator(new RsiParameters(
                        params.getPeriod(),
                        params.getOversold(),
                        params.getOverbought()
                ));
            }
            case MACD -> new MacdSignalGenerator();
            case BOLLINGER_BANDS -> new BollingerBandsSignalGenerator();
            case MOVING_AVERAGE -> new MovingAverageCrossoverSignalGenerator();
        };
    }

    public BacktestDto.Response getBacktest(Long id) {
        BacktestResult entity = backtestResultRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BACKTEST_NOT_FOUND));

        return toResponseWithoutTrades(entity);
    }

    public List<BacktestDto.Response> getBacktestsByUserId(Long userId) {
        return backtestResultRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponseWithoutTrades)
                .toList();
    }

    @Transactional
    public void deleteBacktest(Long userId, Long id) {
        BacktestResult entity = backtestResultRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BACKTEST_NOT_FOUND));

        if (!entity.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        backtestResultRepository.delete(entity);
    }

    private BacktestDto.Response toResponseWithoutTrades(BacktestResult entity) {
        BacktestDto.Response.ResponseBuilder builder = BacktestDto.Response.builder()
                .id(entity.getId())
                .coinId(entity.getCoinId())
                .strategyType(entity.getStrategyType())
                .timeframe(entity.getTimeframe())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .metrics(BacktestDto.MetricsDto.builder()
                        .cumulativeReturn(entity.getCumulativeReturn())
                        .mdd(entity.getMdd())
                        .winRate(entity.getWinRate())
                        .tradeCount(entity.getTradeCount())
                        .build())
                .trades(List.of())
                .createdAt(entity.getCreatedAt());

        // 전략 타입에 따라 파라미터 설정
        parseAndSetParameters(builder, entity.getStrategyType(), entity.getParameters());

        return builder.build();
    }

    private void parseAndSetParameters(
            BacktestDto.Response.ResponseBuilder builder,
            StrategyType strategyType,
            String parametersJson
    ) {
        try {
            switch (strategyType) {
                case RSI -> {
                    var params = objectMapper.readValue(parametersJson, BacktestDto.RsiParameterDto.class);
                    builder.parameters(params);
                    builder.rsiParameters(params);
                }
                case MACD -> {
                    var params = objectMapper.readValue(parametersJson, BacktestDto.MacdParameterDto.class);
                    builder.macdParameters(params);
                }
                case BOLLINGER_BANDS -> {
                    var params = objectMapper.readValue(parametersJson, BacktestDto.BollingerBandsParameterDto.class);
                    builder.bollingerBandsParameters(params);
                }
                case MOVING_AVERAGE -> {
                    var params = objectMapper.readValue(parametersJson, BacktestDto.MovingAverageParameterDto.class);
                    builder.movingAverageParameters(params);
                }
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse parameters: {}", parametersJson);
        }
    }

    private void validateParameters(BacktestDto.Request request) {
        switch (request.getStrategyType()) {
            case RSI -> {
                var params = request.getRsiParams();
                if (params == null) {
                    throw new BusinessException(ErrorCode.INVALID_STRATEGY_PARAMS,
                            "RSI parameters are required");
                }
                if (params.getOversold() >= params.getOverbought()) {
                    throw new BusinessException(ErrorCode.INVALID_STRATEGY_PARAMS,
                            "oversold must be less than overbought");
                }
            }
            case MACD -> {
                var params = request.getMacdParams();
                if (params.getFastPeriod() >= params.getSlowPeriod()) {
                    throw new BusinessException(ErrorCode.INVALID_STRATEGY_PARAMS,
                            "fastPeriod must be less than slowPeriod");
                }
            }
            case MOVING_AVERAGE -> {
                var params = request.getMovingAverageParams();
                if (params.getShortPeriod() >= params.getLongPeriod()) {
                    throw new BusinessException(ErrorCode.INVALID_STRATEGY_PARAMS,
                            "shortPeriod must be less than longPeriod");
                }
            }
            case BOLLINGER_BANDS -> {
                // Bollinger Bands는 추가 검증 불필요
            }
        }
    }

    /**
     * 차트 데이터 생성 - 백테스트에서 사용한 캔들과 지표값을 반환
     */
    private BacktestDto.ChartDataDto buildChartData(List<OhlcvData> candles, BacktestDto.Request request) {
        List<Long> timestamps = candles.stream()
                .map(OhlcvData::timestamp)
                .toList();

        List<BacktestDto.OhlcvDto> ohlcvDtos = candles.stream()
                .map(c -> BacktestDto.OhlcvDto.builder()
                        .timestamp(c.timestamp())
                        .open(c.open())
                        .high(c.high())
                        .low(c.low())
                        .close(c.close())
                        .volume(c.volume())
                        .build())
                .toList();

        BacktestDto.IndicatorValuesDto indicators = buildIndicatorValues(candles, request);

        return BacktestDto.ChartDataDto.builder()
                .timestamps(timestamps)
                .ohlcv(ohlcvDtos)
                .indicators(indicators)
                .build();
    }

    /**
     * 전략 타입에 따른 지표값 계산
     */
    private BacktestDto.IndicatorValuesDto buildIndicatorValues(List<OhlcvData> candles, BacktestDto.Request request) {
        BacktestDto.IndicatorValuesDto.IndicatorValuesDtoBuilder builder = BacktestDto.IndicatorValuesDto.builder();

        switch (request.getStrategyType()) {
            case RSI -> {
                var params = request.getRsiParams();
                List<BigDecimal> rsi = indicatorCalculator.calculateRsi(candles, params.getPeriod());
                builder.rsi(rsi);
            }
            case MACD -> {
                var params = request.getMacdParams();
                var macdResult = indicatorCalculator.calculateMacd(
                        candles,
                        params.getFastPeriod(),
                        params.getSlowPeriod(),
                        params.getSignalPeriod()
                );
                builder.macdLine(macdResult.macdLine())
                        .signalLine(macdResult.signalLine())
                        .histogram(macdResult.histogram());
            }
            case BOLLINGER_BANDS -> {
                var params = request.getBollingerBandsParams();
                var bbResult = indicatorCalculator.calculateBollingerBands(
                        candles,
                        params.getPeriod(),
                        params.getStdDev()
                );
                builder.bbUpper(bbResult.upper())
                        .bbMiddle(bbResult.middle())
                        .bbLower(bbResult.lower());
            }
            case MOVING_AVERAGE -> {
                var params = request.getMovingAverageParams();
                List<BigDecimal> maShort = indicatorCalculator.calculateSma(candles, params.getShortPeriod());
                List<BigDecimal> maLong = indicatorCalculator.calculateSma(candles, params.getLongPeriod());
                builder.maShort(maShort).maLong(maLong);
            }
        }

        return builder.build();
    }

    /**
     * 캔들을 일봉으로 집계 (CoinGecko는 기간에 따라 다른 간격의 캔들 반환)
     * - 1-2일: 30분봉
     * - 3-30일: 4시간봉
     * - 31-90일: 4시간봉
     * - 91일+: 4일봉
     */
    private List<OhlcvData> aggregateToDailyCandles(List<OhlcvData> candles) {
        if (candles.isEmpty()) {
            return candles;
        }

        // 날짜별로 캔들 그룹화
        Map<LocalDate, List<OhlcvData>> candlesByDate = new LinkedHashMap<>();
        for (OhlcvData candle : candles) {
            LocalDate date = Instant.ofEpochMilli(candle.timestamp())
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            candlesByDate.computeIfAbsent(date, k -> new ArrayList<>()).add(candle);
        }

        // 각 날짜의 캔들을 하나의 일봉으로 집계
        List<OhlcvData> dailyCandles = new ArrayList<>();
        for (List<OhlcvData> dayCandles : candlesByDate.values()) {
            if (dayCandles.isEmpty()) continue;

            OhlcvData first = dayCandles.getFirst();
            OhlcvData last = dayCandles.getLast();

            BigDecimal high = dayCandles.stream()
                    .map(OhlcvData::high)
                    .max(BigDecimal::compareTo)
                    .orElse(first.high());

            BigDecimal low = dayCandles.stream()
                    .map(OhlcvData::low)
                    .min(BigDecimal::compareTo)
                    .orElse(first.low());

            BigDecimal volume = dayCandles.stream()
                    .map(c -> c.volume() != null ? c.volume() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            dailyCandles.add(new OhlcvData(
                    first.timestamp(),
                    first.open(),
                    high,
                    low,
                    last.close(),
                    volume
            ));
        }

        return dailyCandles;
    }

    private List<OhlcvData> aggregateCandles(List<OhlcvData> dailyCandles, int aggregateDays) {
        if (dailyCandles.isEmpty() || aggregateDays <= 1) {
            return dailyCandles;
        }

        List<OhlcvData> aggregated = new ArrayList<>();
        for (int i = 0; i < dailyCandles.size(); i += aggregateDays) {
            int endIdx = Math.min(i + aggregateDays, dailyCandles.size());
            List<OhlcvData> group = dailyCandles.subList(i, endIdx);

            if (group.isEmpty()) continue;

            OhlcvData first = group.getFirst();
            OhlcvData last = group.getLast();

            BigDecimal high = group.stream()
                    .map(OhlcvData::high)
                    .max(BigDecimal::compareTo)
                    .orElse(first.high());

            BigDecimal low = group.stream()
                    .map(OhlcvData::low)
                    .min(BigDecimal::compareTo)
                    .orElse(first.low());

            BigDecimal volume = group.stream()
                    .map(c -> c.volume() != null ? c.volume() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            aggregated.add(new OhlcvData(
                    first.timestamp(),
                    first.open(),
                    high,
                    low,
                    last.close(),
                    volume
            ));
        }
        return aggregated;
    }

    private BacktestResult saveBacktestResult(
            BacktestDto.Request request,
            PerformanceMetrics metrics,
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        String parametersJson = serializeParameters(request);

        BacktestResult entity = BacktestResult.builder()
                .userId(userId)
                .coinId(request.getCoinId())
                .strategyType(request.getStrategyType())
                .parameters(parametersJson)
                .timeframe(request.getTimeframe())
                .startDate(startDate)
                .endDate(endDate)
                .cumulativeReturn(metrics.cumulativeReturn())
                .mdd(metrics.mdd())
                .winRate(metrics.winRate())
                .tradeCount(metrics.tradeCount())
                .build();

        return backtestResultRepository.save(entity);
    }

    private String serializeParameters(BacktestDto.Request request) {
        try {
            return switch (request.getStrategyType()) {
                case RSI -> objectMapper.writeValueAsString(request.getRsiParams());
                case MACD -> objectMapper.writeValueAsString(request.getMacdParams());
                case BOLLINGER_BANDS -> objectMapper.writeValueAsString(request.getBollingerBandsParams());
                case MOVING_AVERAGE -> objectMapper.writeValueAsString(request.getMovingAverageParams());
            };
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private BacktestDto.Response buildAnonymousResponse(
            BacktestDto.Request request,
            BacktestOutput output,
            BacktestDto.ChartDataDto chartData,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<BacktestDto.TradeDto> tradeDtos = output.trades().stream()
                .map(this::toTradeDto)
                .toList();

        BacktestDto.Response.ResponseBuilder builder = BacktestDto.Response.builder()
                .id(null)
                .coinId(request.getCoinId())
                .strategyType(request.getStrategyType())
                .timeframe(request.getTimeframe())
                .startDate(startDate)
                .endDate(endDate)
                .metrics(BacktestDto.MetricsDto.builder()
                        .cumulativeReturn(output.metrics().cumulativeReturn())
                        .mdd(output.metrics().mdd())
                        .winRate(output.metrics().winRate())
                        .tradeCount(output.metrics().tradeCount())
                        .build())
                .trades(tradeDtos)
                .chartData(chartData)
                .createdAt(LocalDateTime.now());

        // 전략 타입에 따라 파라미터 설정
        setRequestParameters(builder, request);

        return builder.build();
    }

    private BacktestDto.Response buildResponse(
            BacktestResult entity,
            BacktestOutput output,
            BacktestDto.Request request,
            BacktestDto.ChartDataDto chartData,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<BacktestDto.TradeDto> tradeDtos = output.trades().stream()
                .map(this::toTradeDto)
                .toList();

        BacktestDto.Response.ResponseBuilder builder = BacktestDto.Response.builder()
                .id(entity.getId())
                .coinId(entity.getCoinId())
                .strategyType(entity.getStrategyType())
                .timeframe(entity.getTimeframe())
                .startDate(startDate)
                .endDate(endDate)
                .metrics(BacktestDto.MetricsDto.builder()
                        .cumulativeReturn(output.metrics().cumulativeReturn())
                        .mdd(output.metrics().mdd())
                        .winRate(output.metrics().winRate())
                        .tradeCount(output.metrics().tradeCount())
                        .build())
                .trades(tradeDtos)
                .chartData(chartData)
                .createdAt(entity.getCreatedAt());

        // 전략 타입에 따라 파라미터 설정
        setRequestParameters(builder, request);

        return builder.build();
    }

    private void setRequestParameters(BacktestDto.Response.ResponseBuilder builder, BacktestDto.Request request) {
        switch (request.getStrategyType()) {
            case RSI -> {
                builder.parameters(request.getRsiParams());
                builder.rsiParameters(request.getRsiParams());
            }
            case MACD -> builder.macdParameters(request.getMacdParams());
            case BOLLINGER_BANDS -> builder.bollingerBandsParameters(request.getBollingerBandsParams());
            case MOVING_AVERAGE -> builder.movingAverageParameters(request.getMovingAverageParams());
        }
    }

    private BacktestDto.TradeDto toTradeDto(Trade trade) {
        return BacktestDto.TradeDto.builder()
                .entryTime(LocalDateTime.ofInstant(trade.entryTime(), ZoneId.systemDefault()))
                .exitTime(LocalDateTime.ofInstant(trade.exitTime(), ZoneId.systemDefault()))
                .entryPrice(trade.entryPrice())
                .exitPrice(trade.exitPrice())
                .profit(trade.profit())
                .profitPercent(trade.profitPercent())
                .build();
    }
}
