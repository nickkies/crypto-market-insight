package com.crypto.market.insight.domain.strategy.engine;

import java.math.BigDecimal;

/**
 * 백테스트 설정
 */
public record BacktestConfig(
        BigDecimal initialCapital,
        BigDecimal feeRate,
        BigDecimal slippageRate
) {
    public static final BigDecimal DEFAULT_INITIAL_CAPITAL = BigDecimal.valueOf(10_000_000);
    public static final BigDecimal DEFAULT_FEE_RATE = BigDecimal.valueOf(0.001);      // 0.1%
    public static final BigDecimal DEFAULT_SLIPPAGE_RATE = BigDecimal.valueOf(0.0005); // 0.05%

    public static BacktestConfig defaultConfig() {
        return new BacktestConfig(
                DEFAULT_INITIAL_CAPITAL,
                DEFAULT_FEE_RATE,
                DEFAULT_SLIPPAGE_RATE
        );
    }
}
