package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;

/**
 * CoinGecko coins/markets API 응답 DTO
 *
 * CoinGecko API는 snake_case로 응답하고, 프론트엔드에는 camelCase로 응답합니다.
 * @JsonAlias를 사용하여 snake_case 역직렬화를 지원합니다.
 */
public record CoinMarketData(
        String id,
        String symbol,
        String name,
        String image,

        @JsonAlias("current_price")
        BigDecimal currentPrice,

        @JsonAlias("market_cap")
        BigDecimal marketCap,

        @JsonAlias("market_cap_rank")
        Integer marketCapRank,

        @JsonAlias("total_volume")
        BigDecimal totalVolume,

        @JsonAlias("high_24h")
        BigDecimal high24h,

        @JsonAlias("low_24h")
        BigDecimal low24h,

        @JsonAlias("price_change_24h")
        BigDecimal priceChange24h,

        @JsonAlias("price_change_percentage_24h")
        BigDecimal priceChangePercentage24h,

        @JsonAlias("circulating_supply")
        BigDecimal circulatingSupply,

        @JsonAlias("total_supply")
        BigDecimal totalSupply,

        @JsonAlias("last_updated")
        String lastUpdated
) {
}
