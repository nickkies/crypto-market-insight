package com.crypto.market.insight.domain.strategy.engine;

import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 성과 지표 계산기
 */
public final class MetricsCalculator {

    private static final int SCALE = 4;

    private MetricsCalculator() {
    }

    /**
     * 성과 지표 계산
     *
     * @param trades        거래 기록
     * @param initialCapital 초기 자본
     * @param finalCapital   최종 자본
     * @return 성과 지표
     */
    public static PerformanceMetrics calculate(
            List<Trade> trades,
            BigDecimal initialCapital,
            BigDecimal finalCapital
    ) {
        if (trades.isEmpty()) {
            return PerformanceMetrics.empty();
        }

        // 누적 수익률
        BigDecimal cumulativeReturn = finalCapital.subtract(initialCapital)
                .divide(initialCapital, SCALE, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        // MDD 계산
        BigDecimal mdd = calculateMdd(trades, initialCapital);

        // 승률
        long winCount = trades.stream().filter(Trade::isWin).count();
        BigDecimal winRate = BigDecimal.valueOf(winCount)
                .divide(BigDecimal.valueOf(trades.size()), SCALE, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return new PerformanceMetrics(
                cumulativeReturn.setScale(2, RoundingMode.HALF_UP),
                mdd.setScale(2, RoundingMode.HALF_UP),
                winRate.setScale(2, RoundingMode.HALF_UP),
                trades.size()
        );
    }

    /**
     * MDD(Maximum Drawdown) 계산
     * 최고점 대비 최대 손실률
     */
    private static BigDecimal calculateMdd(List<Trade> trades, BigDecimal initialCapital) {
        BigDecimal peak = initialCapital;
        BigDecimal maxDrawdown = BigDecimal.ZERO;
        BigDecimal currentCapital = initialCapital;

        for (Trade trade : trades) {
            currentCapital = currentCapital.add(trade.profit());

            if (currentCapital.compareTo(peak) > 0) {
                peak = currentCapital;
            }

            BigDecimal drawdown = peak.subtract(currentCapital)
                    .divide(peak, SCALE, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        return maxDrawdown;
    }
}
