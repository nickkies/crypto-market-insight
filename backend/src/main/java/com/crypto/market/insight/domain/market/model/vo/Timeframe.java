package com.crypto.market.insight.domain.market.model.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Timeframe {

    ONE_HOUR("1h", "1"),
    FOUR_HOURS("4h", "1"),
    ONE_DAY("1d", "30"),
    ONE_WEEK("1w", "90");

    private final String value;
    private final String days;

    public static Timeframe fromValue(String value) {
        for (Timeframe timeframe : values()) {
            if (timeframe.value.equals(value)) {
                return timeframe;
            }
        }
        return null;
    }
}
