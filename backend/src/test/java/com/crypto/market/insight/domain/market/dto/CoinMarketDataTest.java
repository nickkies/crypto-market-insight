package com.crypto.market.insight.domain.market.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class CoinMarketDataTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("CoinGecko coins/markets API JSON 응답을 CoinMarketData로 역직렬화한다")
    void deserialize_coinsMarketsResponse() throws Exception {
        // given
        String json = """
                {
                    "id": "bitcoin",
                    "symbol": "btc",
                    "name": "Bitcoin",
                    "image": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
                    "current_price": 97500.25,
                    "market_cap": 1930000000000,
                    "market_cap_rank": 1,
                    "total_volume": 45000000000,
                    "high_24h": 98000.00,
                    "low_24h": 96000.00,
                    "price_change_24h": 1500.50,
                    "price_change_percentage_24h": 1.56,
                    "circulating_supply": 19800000,
                    "total_supply": 21000000,
                    "last_updated": "2024-12-22T10:00:00.000Z"
                }
                """;

        // when
        CoinMarketData result = objectMapper.readValue(json, CoinMarketData.class);

        // then
        assertThat(result.id()).isEqualTo("bitcoin");
        assertThat(result.symbol()).isEqualTo("btc");
        assertThat(result.name()).isEqualTo("Bitcoin");
        assertThat(result.image()).isEqualTo("https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png");
        assertThat(result.currentPrice()).isEqualByComparingTo(new BigDecimal("97500.25"));
        assertThat(result.marketCap()).isEqualByComparingTo(new BigDecimal("1930000000000"));
        assertThat(result.marketCapRank()).isEqualTo(1);
        assertThat(result.totalVolume()).isEqualByComparingTo(new BigDecimal("45000000000"));
        assertThat(result.high24h()).isEqualByComparingTo(new BigDecimal("98000.00"));
        assertThat(result.low24h()).isEqualByComparingTo(new BigDecimal("96000.00"));
        assertThat(result.priceChange24h()).isEqualByComparingTo(new BigDecimal("1500.50"));
        assertThat(result.priceChangePercentage24h()).isEqualByComparingTo(new BigDecimal("1.56"));
        assertThat(result.circulatingSupply()).isEqualByComparingTo(new BigDecimal("19800000"));
        assertThat(result.totalSupply()).isEqualByComparingTo(new BigDecimal("21000000"));
        assertThat(result.lastUpdated()).isEqualTo("2024-12-22T10:00:00.000Z");
    }

    @Test
    @DisplayName("null 값이 포함된 JSON 응답을 처리한다")
    void deserialize_withNullValues() throws Exception {
        // given
        String json = """
                {
                    "id": "bitcoin",
                    "symbol": "btc",
                    "name": "Bitcoin",
                    "image": null,
                    "current_price": 97500.25,
                    "market_cap": null,
                    "market_cap_rank": null,
                    "total_volume": null,
                    "high_24h": null,
                    "low_24h": null,
                    "price_change_24h": null,
                    "price_change_percentage_24h": null,
                    "circulating_supply": null,
                    "total_supply": null,
                    "last_updated": null
                }
                """;

        // when
        CoinMarketData result = objectMapper.readValue(json, CoinMarketData.class);

        // then
        assertThat(result.id()).isEqualTo("bitcoin");
        assertThat(result.symbol()).isEqualTo("btc");
        assertThat(result.name()).isEqualTo("Bitcoin");
        assertThat(result.image()).isNull();
        assertThat(result.currentPrice()).isEqualByComparingTo(new BigDecimal("97500.25"));
        assertThat(result.marketCap()).isNull();
        assertThat(result.marketCapRank()).isNull();
    }

    @Test
    @DisplayName("배열 형태의 JSON 응답을 CoinMarketData 배열로 역직렬화한다")
    void deserialize_arrayResponse() throws Exception {
        // given
        String json = """
                [
                    {
                        "id": "bitcoin",
                        "symbol": "btc",
                        "name": "Bitcoin",
                        "image": "https://example.com/btc.png",
                        "current_price": 97500,
                        "market_cap": 1930000000000,
                        "market_cap_rank": 1,
                        "total_volume": 45000000000,
                        "high_24h": 98000,
                        "low_24h": 96000,
                        "price_change_24h": 1500,
                        "price_change_percentage_24h": 1.56,
                        "circulating_supply": 19800000,
                        "total_supply": 21000000,
                        "last_updated": "2024-12-22T10:00:00.000Z"
                    },
                    {
                        "id": "ethereum",
                        "symbol": "eth",
                        "name": "Ethereum",
                        "image": "https://example.com/eth.png",
                        "current_price": 3400,
                        "market_cap": 410000000000,
                        "market_cap_rank": 2,
                        "total_volume": 20000000000,
                        "high_24h": 3450,
                        "low_24h": 3350,
                        "price_change_24h": 50,
                        "price_change_percentage_24h": 1.49,
                        "circulating_supply": 120000000,
                        "total_supply": null,
                        "last_updated": "2024-12-22T10:00:00.000Z"
                    }
                ]
                """;

        // when
        CoinMarketData[] result = objectMapper.readValue(json, CoinMarketData[].class);

        // then
        assertThat(result).hasSize(2);
        assertThat(result[0].id()).isEqualTo("bitcoin");
        assertThat(result[0].marketCapRank()).isEqualTo(1);
        assertThat(result[1].id()).isEqualTo("ethereum");
        assertThat(result[1].marketCapRank()).isEqualTo(2);
    }
}
