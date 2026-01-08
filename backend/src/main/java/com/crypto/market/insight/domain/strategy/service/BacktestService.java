package com.crypto.market.insight.domain.strategy.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.service.MarketService;
import com.crypto.market.insight.domain.strategy.dto.BacktestDto;
import com.crypto.market.insight.domain.strategy.engine.BacktestConfig;
import com.crypto.market.insight.domain.strategy.engine.BacktestEngine;
import com.crypto.market.insight.domain.strategy.engine.BacktestOutput;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator;
import com.crypto.market.insight.domain.strategy.model.entity.BacktestResult;
import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import com.crypto.market.insight.domain.strategy.repository.BacktestResultRepository;
import com.crypto.market.insight.domain.strategy.signal.RsiSignalGenerator;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BacktestService {

    private final MarketService marketService;
    private final BacktestEngine backtestEngine;
    private final IndicatorCalculator indicatorCalculator;
    private final BacktestResultRepository backtestResultRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public BacktestDto.Response runBacktest(BacktestDto.Request request, Long userId) {
        // 1. 파라미터 검증
        validateParameters(request);

        // 2. Timeframe 파싱
        Timeframe timeframe = marketService.parseTimeframe(request.getTimeframe());

        // 3. 날짜 범위에서 days 계산 (CoinGecko API 지원 값으로 매핑)
        long daysBetween = ChronoUnit.DAYS.between(
                request.getStartDate(),
                request.getEndDate()
        );
        String days = mapToCoinGeckoDays(daysBetween);

        // 4. OHLCV 데이터 조회
        List<OhlcvData> candles = marketService.getOhlcv(request.getCoinId(), days);

        // 5. 날짜 범위로 필터링
        long startTimestamp = request.getStartDate().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = request.getEndDate().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        candles = candles.stream()
                .filter(c -> c.timestamp() >= startTimestamp && c.timestamp() < endTimestamp)
                .toList();

        // 6. Timeframe에 따라 캔들 집계 (3d, 1w의 경우)
        if (timeframe.getAggregateDays() > 1) {
            candles = aggregateCandles(candles, timeframe.getAggregateDays());
        }

        if (candles.size() < request.getParameters().getPeriod() + 2) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_DATA);
        }

        // 5. RSI 계산
        RsiParameters rsiParams = new RsiParameters(
                request.getParameters().getPeriod(),
                request.getParameters().getOversold(),
                request.getParameters().getOverbought()
        );
        List<BigDecimal> rsiValues = indicatorCalculator.calculateRsi(candles, rsiParams.period());

        // 6. 백테스트 실행
        RsiSignalGenerator signalGenerator = new RsiSignalGenerator(rsiParams);
        BacktestOutput output = backtestEngine.run(
                candles,
                rsiValues,
                signalGenerator,
                BacktestConfig.defaultConfig()
        );

        // 7. 인증된 사용자만 DB 저장 (익명은 저장 안 함)
        if (userId != null) {
            BacktestResult entity = saveBacktestResult(request, output.metrics(), userId);
            return buildResponse(entity, output);
        }

        // 8. 익명 사용자는 응답만 반환 (저장 안 함)
        return buildAnonymousResponse(request, output);
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
        BacktestDto.RsiParameterDto parameters = parseParameters(entity.getParameters());

        return BacktestDto.Response.builder()
                .id(entity.getId())
                .coinId(entity.getCoinId())
                .strategyType(entity.getStrategyType())
                .parameters(parameters)
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
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private BacktestDto.RsiParameterDto parseParameters(String parametersJson) {
        try {
            return objectMapper.readValue(parametersJson, BacktestDto.RsiParameterDto.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse parameters: {}", parametersJson);
            return null;
        }
    }

    private void validateParameters(BacktestDto.Request request) {
        BacktestDto.RsiParameterDto params = request.getParameters();
        if (params.getOversold() >= params.getOverbought()) {
            throw new BusinessException(ErrorCode.INVALID_STRATEGY_PARAMS,
                    "oversold must be less than overbought");
        }
    }

    private String mapToCoinGeckoDays(long daysBetween) {
        // CoinGecko API는 특정 days 값만 지원: 1, 7, 14, 30, 90, 180, 365, max
        if (daysBetween <= 1) return "1";
        if (daysBetween <= 7) return "7";
        if (daysBetween <= 14) return "14";
        if (daysBetween <= 30) return "30";
        if (daysBetween <= 90) return "90";
        if (daysBetween <= 180) return "180";
        if (daysBetween <= 365) return "365";
        return "max";
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
            Long userId
    ) {
        String parametersJson;
        try {
            parametersJson = objectMapper.writeValueAsString(request.getParameters());
        } catch (JsonProcessingException e) {
            parametersJson = "{}";
        }

        BacktestResult entity = BacktestResult.builder()
                .userId(userId)
                .coinId(request.getCoinId())
                .strategyType(request.getStrategyType())
                .parameters(parametersJson)
                .timeframe(request.getTimeframe())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .cumulativeReturn(metrics.cumulativeReturn())
                .mdd(metrics.mdd())
                .winRate(metrics.winRate())
                .tradeCount(metrics.tradeCount())
                .build();

        return backtestResultRepository.save(entity);
    }

    private BacktestDto.Response buildAnonymousResponse(BacktestDto.Request request, BacktestOutput output) {
        List<BacktestDto.TradeDto> tradeDtos = output.trades().stream()
                .map(this::toTradeDto)
                .toList();

        return BacktestDto.Response.builder()
                .id(null)
                .coinId(request.getCoinId())
                .strategyType(request.getStrategyType())
                .parameters(request.getParameters())
                .timeframe(request.getTimeframe())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .metrics(BacktestDto.MetricsDto.builder()
                        .cumulativeReturn(output.metrics().cumulativeReturn())
                        .mdd(output.metrics().mdd())
                        .winRate(output.metrics().winRate())
                        .tradeCount(output.metrics().tradeCount())
                        .build())
                .trades(tradeDtos)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private BacktestDto.Response buildResponse(BacktestResult entity, BacktestOutput output) {
        List<BacktestDto.TradeDto> tradeDtos = output.trades().stream()
                .map(this::toTradeDto)
                .toList();

        BacktestDto.RsiParameterDto parameters = parseParameters(entity.getParameters());

        return BacktestDto.Response.builder()
                .id(entity.getId())
                .coinId(entity.getCoinId())
                .strategyType(entity.getStrategyType())
                .parameters(parameters)
                .timeframe(entity.getTimeframe())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .metrics(BacktestDto.MetricsDto.builder()
                        .cumulativeReturn(output.metrics().cumulativeReturn())
                        .mdd(output.metrics().mdd())
                        .winRate(output.metrics().winRate())
                        .tradeCount(output.metrics().tradeCount())
                        .build())
                .trades(tradeDtos)
                .createdAt(entity.getCreatedAt())
                .build();
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
