package com.crypto.market.insight.domain.strategy.model.vo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * MACD 전략 파라미터 VO
 */
public record MacdParameters(
        @NotNull
        @Min(2) @Max(50)
        Integer fastPeriod,

        @NotNull
        @Min(2) @Max(100)
        Integer slowPeriod,

        @NotNull
        @Min(2) @Max(50)
        Integer signalPeriod
) {
    public static MacdParameters defaultParameters() {
        return new MacdParameters(12, 26, 9);
    }

    public void validate() {
        if (fastPeriod >= slowPeriod) {
            throw new IllegalArgumentException("fastPeriod must be less than slowPeriod");
        }
    }
}
