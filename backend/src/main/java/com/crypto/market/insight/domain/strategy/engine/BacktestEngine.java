package com.crypto.market.insight.domain.strategy.engine;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.Position;
import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import com.crypto.market.insight.domain.strategy.signal.SignalGenerator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * 백테스트 시뮬레이션 엔진
 */
@Component
public class BacktestEngine {

    private static final int SCALE = 8;

    /**
     * 백테스트 실행
     *
     * @param candles         OHLCV 데이터
     * @param indicatorValues 지표 값 리스트 (candles와 1:1 매핑, 첫 N개는 null 가능)
     * @param signalGenerator 시그널 생성기
     * @param config          백테스트 설정
     * @return 백테스트 결과
     */
    public BacktestOutput run(
            List<OhlcvData> candles,
            List<BigDecimal> indicatorValues,
            SignalGenerator signalGenerator,
            BacktestConfig config
    ) {
        if (candles == null || candles.size() < 2) {
            return BacktestOutput.empty();
        }

        List<Trade> trades = new ArrayList<>();
        Position currentPosition = null;
        Signal pendingSignal = null;
        int pendingSignalIndex = -1;

        BigDecimal capital = config.initialCapital();

        // 캔들 순회 (마지막 캔들 제외 - 다음 캔들 시가에서 체결해야 하므로)
        for (int i = 0; i < candles.size() - 1; i++) {
            OhlcvData currentCandle = candles.get(i);
            OhlcvData nextCandle = candles.get(i + 1);

            // 이전 시그널 처리 (다음 캔들 시가에서 체결)
            if (pendingSignal != null && pendingSignalIndex == i - 1) {
                if (pendingSignal == Signal.BUY && currentPosition == null) {
                    // 진입
                    BigDecimal entryPrice = applySlippage(currentCandle.open(), config.slippageRate(), true);
                    BigDecimal fee = capital.multiply(config.feeRate());
                    BigDecimal availableCapital = capital.subtract(fee);
                    BigDecimal quantity = availableCapital.divide(entryPrice, SCALE, RoundingMode.DOWN);

                    currentPosition = new Position(
                            entryPrice,
                            quantity,
                            Instant.ofEpochMilli(currentCandle.timestamp())
                    );
                    capital = BigDecimal.ZERO;
                } else if (pendingSignal == Signal.SELL && currentPosition != null) {
                    // 청산
                    BigDecimal exitPrice = applySlippage(currentCandle.open(), config.slippageRate(), false);
                    Trade trade = closePosition(currentPosition, exitPrice, currentCandle.timestamp(), config.feeRate());
                    trades.add(trade);

                    capital = currentPosition.quantity().multiply(exitPrice)
                            .subtract(currentPosition.quantity().multiply(exitPrice).multiply(config.feeRate()));
                    currentPosition = null;
                }
                pendingSignal = null;
            }

            // 현재 캔들에서 시그널 생성
            BigDecimal indicatorValue = i < indicatorValues.size() ? indicatorValues.get(i) : null;
            Signal signal = signalGenerator.generate(indicatorValue);

            if (signal != Signal.HOLD) {
                pendingSignal = signal;
                pendingSignalIndex = i;
            }
        }

        // 마지막 포지션 강제 청산
        if (currentPosition != null) {
            OhlcvData lastCandle = candles.get(candles.size() - 1);
            BigDecimal exitPrice = lastCandle.close();
            Trade trade = closePosition(currentPosition, exitPrice, lastCandle.timestamp(), config.feeRate());
            trades.add(trade);

            capital = currentPosition.quantity().multiply(exitPrice)
                    .subtract(currentPosition.quantity().multiply(exitPrice).multiply(config.feeRate()));
        }

        PerformanceMetrics metrics = MetricsCalculator.calculate(trades, config.initialCapital(), capital);

        return new BacktestOutput(trades, metrics);
    }

    private BigDecimal applySlippage(BigDecimal price, BigDecimal slippageRate, boolean isBuy) {
        BigDecimal slippage = price.multiply(slippageRate);
        return isBuy ? price.add(slippage) : price.subtract(slippage);
    }

    private Trade closePosition(Position position, BigDecimal exitPrice, Long exitTimestamp, BigDecimal feeRate) {
        BigDecimal grossProfit = exitPrice.subtract(position.entryPrice()).multiply(position.quantity());
        BigDecimal fee = exitPrice.multiply(position.quantity()).multiply(feeRate);
        BigDecimal netProfit = grossProfit.subtract(fee);

        BigDecimal entryValue = position.entryPrice().multiply(position.quantity());
        BigDecimal profitPercent = entryValue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.divide(entryValue, SCALE, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return new Trade(
                position.entryTime(),
                Instant.ofEpochMilli(exitTimestamp),
                position.entryPrice(),
                exitPrice,
                position.quantity(),
                netProfit.setScale(2, RoundingMode.HALF_UP),
                profitPercent.setScale(2, RoundingMode.HALF_UP)
        );
    }
}
