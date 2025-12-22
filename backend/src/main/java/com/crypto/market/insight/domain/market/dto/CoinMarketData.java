package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.math.BigDecimal;

/**
 * CoinGecko coins/markets API 응답 DTO
 *
 * @param id 코인 ID (예: "bitcoin")
 * @param symbol 코인 심볼 (예: "btc")
 * @param name 코인 이름 (예: "Bitcoin")
 * @param image 코인 이미지 URL
 * @param currentPrice 현재 가격
 * @param marketCap 시가총액
 * @param marketCapRank 시가총액 순위
 * @param totalVolume 24시간 거래량
 * @param high24h 24시간 최고가
 * @param low24h 24시간 최저가
 * @param priceChange24h 24시간 가격 변화액
 * @param priceChangePercentage24h 24시간 가격 변화율 (%)
 * @param circulatingSupply 순환 공급량
 * @param totalSupply 총 공급량
 * @param lastUpdated 마지막 업데이트 시간 (ISO 8601)
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CoinMarketData(
        String id,
        String symbol,
        String name,
        String image,
        BigDecimal currentPrice,
        BigDecimal marketCap,
        Integer marketCapRank,
        BigDecimal totalVolume,

        @JsonProperty("high_24h")
        BigDecimal high24h,

        @JsonProperty("low_24h")
        BigDecimal low24h,

        @JsonProperty("price_change_24h")
        BigDecimal priceChange24h,

        @JsonProperty("price_change_percentage_24h")
        BigDecimal priceChangePercentage24h,

        BigDecimal circulatingSupply,
        BigDecimal totalSupply,
        String lastUpdated
) {
}
