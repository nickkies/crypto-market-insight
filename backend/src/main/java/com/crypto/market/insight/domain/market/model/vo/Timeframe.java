package com.crypto.market.insight.domain.market.model.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Timeframe {

    ONE_DAY("1d", "30", 1),
    THREE_DAYS("3d", "90", 3),
    ONE_WEEK("1w", "180", 7);

    private final String value;
    private final String days;
    private final int aggregateDays; // 캔들 집계 일 수

    public static Timeframe fromValue(String value) {
        for (Timeframe timeframe : values()) {
            if (timeframe.value.equals(value)) {
                return timeframe;
            }
        }
        return null;
    }
}
