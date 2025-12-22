package com.crypto.market.insight.integration;

import com.crypto.market.insight.config.CacheConfig;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.github.tomakehurst.wiremock.WireMockServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CoinGeckoClientCacheTest {

    static WireMockServer wireMockServer = new WireMockServer(0);

    @Autowired
    private CoinGeckoClient coinGeckoClient;

    @Autowired
    private CacheManager cacheManager;

    @BeforeAll
    static void startWireMock() {
        wireMockServer.start();
        configureFor(wireMockServer.port());
    }

    @AfterAll
    static void stopWireMock() {
        wireMockServer.stop();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        wireMockServer.start();
        registry.add("app.coingecko.base-url", () -> "http://localhost:" + wireMockServer.port());
    }

    @BeforeEach
    void setUp() {
        cacheManager.getCache(CacheConfig.COIN_MARKETS).clear();
        cacheManager.getCache(CacheConfig.OHLC).clear();
        wireMockServer.resetAll();
    }

    @Test
    @DisplayName("getCoinsMarkets - 두 번째 호출은 캐시에서 반환한다")
    void getCoinsMarkets_secondCall_returnsFromCache() {
        // given
        stubFor(get(urlPathEqualTo("/coins/markets"))
                .willReturn(okJson("""
                        [{"id": "bitcoin", "symbol": "btc", "name": "Bitcoin", "current_price": 97500}]
                        """)));

        // when
        List<CoinMarketData> first = coinGeckoClient.getCoinsMarkets("usd", "bitcoin", 100, 1);
        List<CoinMarketData> second = coinGeckoClient.getCoinsMarkets("usd", "bitcoin", 100, 1);

        // then
        assertThat(first).hasSize(1);
        assertThat(second).hasSize(1);
        verify(1, getRequestedFor(urlPathEqualTo("/coins/markets")));
    }

    @Test
    @DisplayName("getCoinsMarkets - 다른 파라미터는 캐시 미스")
    void getCoinsMarkets_differentParams_cacheMiss() {
        // given
        stubFor(get(urlPathEqualTo("/coins/markets"))
                .willReturn(okJson("""
                        [{"id": "bitcoin", "symbol": "btc", "name": "Bitcoin", "current_price": 97500}]
                        """)));

        // when
        coinGeckoClient.getCoinsMarkets("usd", "bitcoin", 100, 1);
        coinGeckoClient.getCoinsMarkets("krw", "bitcoin", 100, 1);

        // then
        verify(2, getRequestedFor(urlPathEqualTo("/coins/markets")));
    }

    @Test
    @DisplayName("getOhlc - 두 번째 호출은 캐시에서 반환한다")
    void getOhlc_secondCall_returnsFromCache() {
        // given
        stubFor(get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                .willReturn(okJson("""
                        [[1709395200000, 61942, 62211, 61721, 61845]]
                        """)));

        // when
        List<OhlcData> first = coinGeckoClient.getOhlc("bitcoin", "usd", "7");
        List<OhlcData> second = coinGeckoClient.getOhlc("bitcoin", "usd", "7");

        // then
        assertThat(first).hasSize(1);
        assertThat(second).hasSize(1);
        verify(1, getRequestedFor(urlPathEqualTo("/coins/bitcoin/ohlc")));
    }

    @Test
    @DisplayName("getOhlc - 다른 days 파라미터는 캐시 미스")
    void getOhlc_differentDays_cacheMiss() {
        // given
        stubFor(get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                .willReturn(okJson("""
                        [[1709395200000, 61942, 62211, 61721, 61845]]
                        """)));

        // when
        coinGeckoClient.getOhlc("bitcoin", "usd", "7");
        coinGeckoClient.getOhlc("bitcoin", "usd", "30");

        // then
        verify(2, getRequestedFor(urlPathEqualTo("/coins/bitcoin/ohlc")));
    }
}
