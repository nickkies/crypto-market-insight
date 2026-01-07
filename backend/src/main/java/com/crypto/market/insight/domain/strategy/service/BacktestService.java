package com.crypto.market.insight.domain.strategy.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

        // 2. OHLCV 데이터 조회
        Timeframe timeframe = marketService.parseTimeframe(request.getTimeframe());
        List<OhlcvData> candles = marketService.getOhlcv(request.getCoinId(), timeframe);

        if (candles.size() < request.getParameters().getPeriod() + 2) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_DATA);
        }

        // 3. RSI 계산
        RsiParameters rsiParams = new RsiParameters(
                request.getParameters().getPeriod(),
                request.getParameters().getOversold(),
                request.getParameters().getOverbought()
        );
        List<BigDecimal> rsiValues = indicatorCalculator.calculateRsi(candles, rsiParams.period());

        // 4. 백테스트 실행
        RsiSignalGenerator signalGenerator = new RsiSignalGenerator(rsiParams);
        BacktestOutput output = backtestEngine.run(
                candles,
                rsiValues,
                signalGenerator,
                BacktestConfig.defaultConfig()
        );

        // 5. DB 저장
        BacktestResult entity = saveBacktestResult(request, output.metrics(), userId);

        // 6. 응답 생성
        return buildResponse(entity, output);
    }

    public BacktestDto.Response getBacktest(Long id) {
        BacktestResult entity = backtestResultRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BACKTEST_NOT_FOUND));

        return BacktestDto.Response.builder()
                .id(entity.getId())
                .coinId(entity.getCoinId())
                .strategyType(entity.getStrategyType())
                .metrics(BacktestDto.MetricsDto.builder()
                        .cumulativeReturn(entity.getCumulativeReturn())
                        .mdd(entity.getMdd())
                        .winRate(entity.getWinRate())
                        .tradeCount(entity.getTradeCount())
                        .build())
                .trades(List.of()) // Trade 내역은 별도 저장하지 않음
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private void validateParameters(BacktestDto.Request request) {
        BacktestDto.RsiParameterDto params = request.getParameters();
        if (params.getOversold() >= params.getOverbought()) {
            throw new BusinessException(ErrorCode.INVALID_STRATEGY_PARAMS,
                    "oversold must be less than overbought");
        }
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
                .userId(userId != null ? userId : 0L)
                .coinId(request.getCoinId())
                .strategyType(request.getStrategyType())
                .parameters(parametersJson)
                .cumulativeReturn(metrics.cumulativeReturn())
                .mdd(metrics.mdd())
                .winRate(metrics.winRate())
                .tradeCount(metrics.tradeCount())
                .build();

        return backtestResultRepository.save(entity);
    }

    private BacktestDto.Response buildResponse(BacktestResult entity, BacktestOutput output) {
        List<BacktestDto.TradeDto> tradeDtos = output.trades().stream()
                .map(this::toTradeDto)
                .toList();

        return BacktestDto.Response.builder()
                .id(entity.getId())
                .coinId(entity.getCoinId())
                .strategyType(entity.getStrategyType())
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
