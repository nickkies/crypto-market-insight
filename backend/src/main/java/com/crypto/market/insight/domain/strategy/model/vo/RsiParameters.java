package com.crypto.market.insight.domain.strategy.model.vo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * RSI 전략 파라미터 VO
 */
public record RsiParameters(
        @NotNull
        @Min(2) @Max(100)
        Integer period,

        @NotNull
        @Min(0) @Max(100)
        Integer oversold,

        @NotNull
        @Min(0) @Max(100)
        Integer overbought
) {
    public static RsiParameters defaultParameters() {
        return new RsiParameters(14, 30, 70);
    }

    public void validate() {
        if (oversold >= overbought) {
            throw new IllegalArgumentException("oversold must be less than overbought");
        }
    }
}
