package com.crypto.market.insight.support.fixture;

import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import java.math.BigDecimal;
import java.util.List;

public final class MarketFixture {

    private MarketFixture() {
    }

    // === JSON Responses for WireMock ===

    public static final String BITCOIN_MARKET_JSON = """
            {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://example.com/btc.png",
                "current_price": 97500.25,
                "market_cap": 1930000000000,
                "market_cap_rank": 1,
                "total_volume": 50000000000,
                "high_24h": 98000,
                "low_24h": 96000,
                "price_change_24h": 1500,
                "price_change_percentage_24h": 1.56,
                "circulating_supply": 19000000,
                "total_supply": 21000000,
                "last_updated": "2024-01-01T00:00:00.000Z"
            }
            """;

    public static final String ETHEREUM_MARKET_JSON = """
            {
                "id": "ethereum",
                "symbol": "eth",
                "name": "Ethereum",
                "image": "https://example.com/eth.png",
                "current_price": 3400.50,
                "market_cap": 410000000000,
                "market_cap_rank": 2,
                "total_volume": 20000000000,
                "high_24h": 3500,
                "low_24h": 3300,
                "price_change_24h": -50,
                "price_change_percentage_24h": -1.2,
                "circulating_supply": 120000000,
                "total_supply": null,
                "last_updated": "2024-01-01T00:00:00.000Z"
            }
            """;

    public static String coinsMarketsJson(String... coins) {
        return "[" + String.join(",", coins) + "]";
    }

    public static final String OHLC_DATA_JSON = """
            [
                [1709395200000, 61942, 62211, 61721, 61845],
                [1709409600000, 61828, 62139, 61726, 62139],
                [1709424000000, 62171, 62210, 61821, 62068]
            ]
            """;

    public static final String OHLC_SINGLE_JSON = "[[1709395200000, 61942, 62211, 61721, 61845]]";

    public static final String EMPTY_ARRAY_JSON = "[]";

    // === Object Fixtures ===

    public static CoinMarketData bitcoin() {
        return new CoinMarketData(
                "bitcoin",
                "btc",
                "Bitcoin",
                "https://example.com/btc.png",
                new BigDecimal("97500.25"),
                new BigDecimal("1930000000000"),
                1,
                new BigDecimal("50000000000"),
                new BigDecimal("98000"),
                new BigDecimal("96000"),
                new BigDecimal("1500"),
                new BigDecimal("1.56"),
                new BigDecimal("19000000"),
                new BigDecimal("21000000"),
                "2024-01-01T00:00:00.000Z"
        );
    }

    public static CoinMarketData ethereum() {
        return new CoinMarketData(
                "ethereum",
                "eth",
                "Ethereum",
                "https://example.com/eth.png",
                new BigDecimal("3400.50"),
                new BigDecimal("410000000000"),
                2,
                new BigDecimal("20000000000"),
                new BigDecimal("3500"),
                new BigDecimal("3300"),
                new BigDecimal("-50"),
                new BigDecimal("-1.2"),
                new BigDecimal("120000000"),
                null,
                "2024-01-01T00:00:00.000Z"
        );
    }

    public static CoinMarketData coin(String id, String symbol, String name) {
        return new CoinMarketData(
                id,
                symbol,
                name,
                "https://example.com/" + symbol + ".png",
                new BigDecimal("50000"),
                new BigDecimal("1000000000000"),
                1,
                new BigDecimal("500000000"),
                new BigDecimal("51000"),
                new BigDecimal("49000"),
                new BigDecimal("500"),
                new BigDecimal("1.5"),
                new BigDecimal("19000000"),
                new BigDecimal("21000000"),
                "2024-01-01T00:00:00.000Z"
        );
    }

    public static List<CoinMarketData> defaultCoins() {
        return List.of(bitcoin(), ethereum());
    }

    public static OhlcData ohlc(long timestamp, String open, String high, String low, String close) {
        return new OhlcData(
                timestamp,
                new BigDecimal(open),
                new BigDecimal(high),
                new BigDecimal(low),
                new BigDecimal(close)
        );
    }

    public static List<OhlcData> defaultOhlcList() {
        return List.of(
                ohlc(1709395200000L, "61942", "62211", "61721", "61845"),
                ohlc(1709409600000L, "61828", "62139", "61726", "62139"),
                ohlc(1709424000000L, "62171", "62210", "61821", "62068")
        );
    }
}
