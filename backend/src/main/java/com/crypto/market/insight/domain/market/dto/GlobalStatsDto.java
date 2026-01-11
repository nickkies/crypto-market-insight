package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

public class GlobalStatsDto {

    /**
     * CoinGecko /global API 원본 응답
     */
    public record CoinGeckoGlobalResponse(
            Data data
    ) {
        public record Data(
                @JsonProperty("active_cryptocurrencies")
                Integer activeCryptocurrencies,

                @JsonProperty("total_market_cap")
                java.util.Map<String, BigDecimal> totalMarketCap,

                @JsonProperty("total_volume")
                java.util.Map<String, BigDecimal> totalVolume,

                @JsonProperty("market_cap_percentage")
                java.util.Map<String, BigDecimal> marketCapPercentage,

                @JsonProperty("market_cap_change_percentage_24h_usd")
                BigDecimal marketCapChangePercentage24hUsd
        ) {}
    }

    /**
     * API 응답 DTO
     */
    @Schema(description = "글로벌 시장 통계")
    public record GlobalStatsResponse(
            @Schema(description = "총 시가총액 (USD)", example = "2500000000000")
            BigDecimal totalMarketCap,

            @Schema(description = "24시간 총 거래량 (USD)", example = "85000000000")
            BigDecimal total24hVolume,

            @Schema(description = "BTC 도미넌스 (%)", example = "52.5")
            BigDecimal btcDominance,

            @Schema(description = "활성 암호화폐 수", example = "14500")
            Integer activeCryptocurrencies,

            @Schema(description = "24시간 시가총액 변화율 (%)", example = "-1.25")
            BigDecimal marketCapChange24h
    ) {
        public static GlobalStatsResponse from(CoinGeckoGlobalResponse response) {
            var data = response.data();
            if (data == null) {
                return new GlobalStatsResponse(
                        BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0, BigDecimal.ZERO
                );
            }
            return new GlobalStatsResponse(
                    getMapValue(data.totalMarketCap(), "usd"),
                    getMapValue(data.totalVolume(), "usd"),
                    getMapValue(data.marketCapPercentage(), "btc"),
                    data.activeCryptocurrencies() != null ? data.activeCryptocurrencies() : 0,
                    data.marketCapChangePercentage24hUsd() != null
                            ? data.marketCapChangePercentage24hUsd() : BigDecimal.ZERO
            );
        }

        private static BigDecimal getMapValue(java.util.Map<String, BigDecimal> map, String key) {
            if (map == null) return BigDecimal.ZERO;
            return map.getOrDefault(key, BigDecimal.ZERO);
        }
    }
}
