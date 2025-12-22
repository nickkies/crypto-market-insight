package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * CoinGecko OHLC API 응답 DTO
 * <p>
 * CoinGecko OHLC API는 배열 형태로 응답: [timestamp, open, high, low, close]
 *
 * @param timestamp 종가 시점 (Unix 밀리초)
 * @param open 시가
 * @param high 고가
 * @param low 저가
 * @param close 종가
 */
@JsonDeserialize(using = OhlcDataDeserializer.class)
public record OhlcData(
        Long timestamp,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close
) {
    /**
     * timestamp를 Instant로 변환
     */
    public Instant toInstant() {
        return Instant.ofEpochMilli(timestamp);
    }
}
