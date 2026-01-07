package com.crypto.market.insight.domain.strategy.model.vo;

import java.math.BigDecimal;

/**
 * 백테스트 성과 지표 VO
 */
public record PerformanceMetrics(
        BigDecimal cumulativeReturn,
        BigDecimal mdd,
        BigDecimal winRate,
        int tradeCount
) {
    public static PerformanceMetrics empty() {
        return new PerformanceMetrics(
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                0
        );
    }
}
