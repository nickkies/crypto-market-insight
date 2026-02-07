package com.crypto.market.insight.support.fixture;

import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class MarketFixture {

    private static final String FIXTURES_BASE = "/fixtures/market";

    private MarketFixture() {
    }

    // === JSON Responses for WireMock (classpath 기반) ===

    public static String bitcoinJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/happy/bitcoin.json");
    }

    public static String ethereumJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/happy/ethereum.json");
    }

    public static String coinsJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/happy/coins.json");
    }

    public static String coinsMarketsJson(String... coins) {
        return "[" + String.join(",", coins) + "]";
    }

    public static String ohlcJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/happy/ohlc.json");
    }

    public static String marketChartJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/happy/market-chart.json");
    }

    public static String globalStatsJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/happy/global-stats.json");
    }

    public static String emptyCoinsJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/edge/empty-coins.json");
    }

    public static String emptyMarketChartJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/edge/empty-market-chart.json");
    }

    public static String rateLimitErrorJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/error/rate-limit.json");
    }

    public static String serverErrorJson() {
        return FixtureLoader.loadRawFromClasspath(FIXTURES_BASE + "/error/server-error.json");
    }

    // === 하위 호환 상수 (deprecated, JSON 파일 사용 권장) ===

    @Deprecated
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

    @Deprecated
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

    @Deprecated
    public static final String OHLC_DATA_JSON = """
            [
                [1709395200000, 61942, 62211, 61721, 61845],
                [1709409600000, 61828, 62139, 61726, 62139],
                [1709424000000, 62171, 62210, 61821, 62068]
            ]
            """;

    @Deprecated
    public static final String OHLC_SINGLE_JSON = "[[1709395200000, 61942, 62211, 61721, 61845]]";

    @Deprecated
    public static final String MARKET_CHART_JSON = """
            {
                "prices": [[1709395200000, 61845], [1709409600000, 62139], [1709424000000, 62068]],
                "market_caps": [[1709395200000, 1200000000000], [1709409600000, 1210000000000], [1709424000000, 1205000000000]],
                "total_volumes": [[1709395200000, 25000000000], [1709409600000, 26000000000], [1709424000000, 24000000000]]
            }
            """;

    @Deprecated
    public static final String MARKET_CHART_EMPTY_JSON = """
            {
                "prices": [],
                "market_caps": [],
                "total_volumes": []
            }
            """;

    @Deprecated
    public static final String EMPTY_ARRAY_JSON = "[]";

    @Deprecated
    public static final String GLOBAL_STATS_JSON = """
            {
                "data": {
                    "active_cryptocurrencies": 14500,
                    "total_market_cap": {
                        "usd": 2500000000000
                    },
                    "total_volume": {
                        "usd": 85000000000
                    },
                    "market_cap_percentage": {
                        "btc": 52.5,
                        "eth": 17.3
                    },
                    "market_cap_change_percentage_24h_usd": -1.25
                }
            }
            """;

    // === Object Fixtures ===

    public static CoinMarketData bitcoin() {
        return FixtureLoader.loadFromClasspath(FIXTURES_BASE + "/happy/bitcoin.json", CoinMarketData.class);
    }

    public static CoinMarketData ethereum() {
        return FixtureLoader.loadFromClasspath(FIXTURES_BASE + "/happy/ethereum.json", CoinMarketData.class);
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
        return FixtureLoader.loadListFromClasspath(FIXTURES_BASE + "/happy/coins.json", CoinMarketData.class);
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

    // === OhlcvData Fixtures for Indicator Tests ===

    public static OhlcvData ohlcv(long timestamp, double close) {
        BigDecimal price = BigDecimal.valueOf(close);
        return new OhlcvData(timestamp, price, price, price, price, BigDecimal.valueOf(1000));
    }

    public static List<OhlcvData> ohlcvFromPrices(double... closePrices) {
        List<OhlcvData> candles = new ArrayList<>();
        long baseTimestamp = 1709395200000L;
        for (int i = 0; i < closePrices.length; i++) {
            candles.add(ohlcv(baseTimestamp + (i * 86400000L), closePrices[i]));
        }
        return candles;
    }

    /**
     * RSI 테스트용: 16개 캔들 (period=14 기준 RSI 2개 계산 가능)
     */
    public static List<OhlcvData> rsiTestCandles() {
        return ohlcvFromPrices(
                100.0, 101.0, 102.0, 101.5, 102.5,
                103.0, 102.0, 103.5, 104.0, 103.5,
                104.5, 105.0, 104.0, 105.5, 106.0,
                105.0
        );
    }

    /**
     * RSI 테스트용: 연속 상승 (RSI 100)
     */
    public static List<OhlcvData> rsiAllGainsCandles() {
        return ohlcvFromPrices(
                100.0, 101.0, 102.0, 103.0, 104.0,
                105.0, 106.0, 107.0, 108.0, 109.0
        );
    }

    /**
     * RSI 테스트용: 연속 하락 (RSI 0)
     */
    public static List<OhlcvData> rsiAllLossesCandles() {
        return ohlcvFromPrices(
                109.0, 108.0, 107.0, 106.0, 105.0,
                104.0, 103.0, 102.0, 101.0, 100.0
        );
    }

    /**
     * RSI 테스트용: 상승/하락 균형 (RSI ~50)
     */
    public static List<OhlcvData> rsiBalancedCandles() {
        return ohlcvFromPrices(
                100.0, 101.0, 100.0, 101.0, 100.0,
                101.0, 100.0, 101.0, 100.0, 101.0
        );
    }

    /**
     * 지표 API 테스트용: 100개 OHLC 데이터 JSON 생성
     */
    public static String indicatorOhlcJson() {
        StringBuilder sb = new StringBuilder("[");
        long baseTimestamp = 1709395200000L;
        double basePrice = 50000.0;

        for (int i = 0; i < 100; i++) {
            if (i > 0) sb.append(",");
            long timestamp = baseTimestamp + (i * 86400000L);
            double price = basePrice + (i * 100) + (Math.sin(i * 0.3) * 500);
            double open = price - 50;
            double high = price + 100;
            double low = price - 100;
            double close = price;
            sb.append(String.format("[%d, %.2f, %.2f, %.2f, %.2f]",
                    timestamp, open, high, low, close));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * 지표 API 테스트용: Market Chart JSON
     */
    public static String indicatorMarketChartJson() {
        StringBuilder prices = new StringBuilder("[");
        StringBuilder volumes = new StringBuilder("[");
        long baseTimestamp = 1709395200000L;
        double basePrice = 50000.0;
        double baseVolume = 1000000000.0;

        for (int i = 0; i < 100; i++) {
            if (i > 0) {
                prices.append(",");
                volumes.append(",");
            }
            long timestamp = baseTimestamp + (i * 86400000L);
            double price = basePrice + (i * 100) + (Math.sin(i * 0.3) * 500);
            double volume = baseVolume + (Math.random() * 100000000);

            prices.append(String.format("[%d, %.2f]", timestamp, price));
            volumes.append(String.format("[%d, %.2f]", timestamp, volume));
        }
        prices.append("]");
        volumes.append("]");

        return String.format("""
                {
                    "prices": %s,
                    "market_caps": [],
                    "total_volumes": %s
                }
                """, prices, volumes);
    }
}
