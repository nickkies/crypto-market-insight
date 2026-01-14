package com.crypto.market.insight.domain.strategy.model.vo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Bollinger Bands 전략 파라미터 VO
 */
public record BollingerBandsParameters(
        @NotNull
        @Min(2) @Max(100)
        Integer period,

        @NotNull
        @Min(1) @Max(5)
        Double stdDev
) {
    public static BollingerBandsParameters defaultParameters() {
        return new BollingerBandsParameters(20, 2.0);
    }
}
