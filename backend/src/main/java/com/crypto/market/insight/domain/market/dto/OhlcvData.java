package com.crypto.market.insight.domain.market.dto;

import java.math.BigDecimal;

/**
 * OHLCV (Open, High, Low, Close, Volume) 데이터 DTO
 *
 * @param timestamp 종가 시점 (Unix 밀리초)
 * @param open 시가
 * @param high 고가
 * @param low 저가
 * @param close 종가
 * @param volume 거래량 (null 가능)
 */
public record OhlcvData(
        Long timestamp,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close,
        BigDecimal volume
) {
    /**
     * OhlcData에서 OhlcvData 생성 (volume 없이)
     */
    public static OhlcvData from(OhlcData ohlc) {
        return new OhlcvData(
                ohlc.timestamp(),
                ohlc.open(),
                ohlc.high(),
                ohlc.low(),
                ohlc.close(),
                null
        );
    }

    /**
     * OhlcData와 volume을 합쳐서 OhlcvData 생성
     */
    public static OhlcvData from(OhlcData ohlc, BigDecimal volume) {
        return new OhlcvData(
                ohlc.timestamp(),
                ohlc.open(),
                ohlc.high(),
                ohlc.low(),
                ohlc.close(),
                volume
        );
    }
}
