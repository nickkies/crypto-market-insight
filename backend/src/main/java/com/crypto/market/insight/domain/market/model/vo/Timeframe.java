package com.crypto.market.insight.domain.market.model.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Timeframe {

    ONE_DAY("1d", "30", 1, 30),      // 30일간 = 더 변동성 있는 데이터
    THREE_DAYS("3d", "90", 3, 90),   // 90일간 3일봉 = 30개 캔들
    ONE_WEEK("1w", "180", 7, 180);   // 180일간 주봉 = 26개 캔들

    private final String value;
    private final String days;           // CoinGecko API 요청용
    private final int aggregateDays;     // 캔들 집계 일 수
    private final int backtestPeriod;    // 백테스트 기간 (일)

    public static Timeframe fromValue(String value) {
        for (Timeframe timeframe : values()) {
            if (timeframe.value.equals(value)) {
                return timeframe;
            }
        }
        return null;
    }
}
