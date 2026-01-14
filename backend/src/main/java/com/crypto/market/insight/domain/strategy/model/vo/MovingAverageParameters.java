package com.crypto.market.insight.domain.strategy.model.vo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Moving Average Crossover 전략 파라미터 VO
 */
public record MovingAverageParameters(
        @NotNull
        @Min(2) @Max(50)
        Integer shortPeriod,

        @NotNull
        @Min(2) @Max(200)
        Integer longPeriod
) {
    public static MovingAverageParameters defaultParameters() {
        return new MovingAverageParameters(10, 20);
    }

    public void validate() {
        if (shortPeriod >= longPeriod) {
            throw new IllegalArgumentException("shortPeriod must be less than longPeriod");
        }
    }
}
