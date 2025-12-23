package com.crypto.market.insight.integration;

import static com.crypto.market.insight.support.fixture.MarketFixture.*;
import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.crypto.market.insight.config.CacheConfig;
import com.github.tomakehurst.wiremock.WireMockServer;
import java.util.Objects;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MarketControllerIntegrationTest {

    static WireMockServer wireMockServer = new WireMockServer(0);

    @Autowired
    private MockMvc mockMvc;

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
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.COIN_MARKETS)).clear();
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.OHLC)).clear();
        wireMockServer.resetAll();
    }

    @Nested
    @DisplayName("GET /api/market/coins")
    class GetCoins {

        @Test
        @DisplayName("코인 목록 조회 성공")
        void success() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/markets"))
                    .willReturn(okJson(coinsMarketsJson(BITCOIN_MARKET_JSON, ETHEREUM_MARKET_JSON))));

            // when & then
            mockMvc.perform(get("/api/market/coins")
                            .param("page", "1")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.coins").isArray())
                    .andExpect(jsonPath("$.coins.length()").value(2))
                    .andExpect(jsonPath("$.coins[0].id").value("bitcoin"))
                    .andExpect(jsonPath("$.coins[0].symbol").value("btc"))
                    .andExpect(jsonPath("$.coins[1].id").value("ethereum"))
                    .andExpect(jsonPath("$.page").value(1))
                    .andExpect(jsonPath("$.size").value(10));
        }

        @Test
        @DisplayName("page가 0이면 422 에러")
        void invalidPage_returns422() throws Exception {
            mockMvc.perform(get("/api/market/coins")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("size가 251이면 422 에러")
        void invalidSize_returns422() throws Exception {
            mockMvc.perform(get("/api/market/coins")
                            .param("page", "1")
                            .param("size", "251"))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("키워드로 필터링 성공")
        void filterByKeyword() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/markets"))
                    .willReturn(okJson(coinsMarketsJson(BITCOIN_MARKET_JSON, ETHEREUM_MARKET_JSON))));

            // when & then
            mockMvc.perform(get("/api/market/coins")
                            .param("keyword", "btc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.coins.length()").value(1))
                    .andExpect(jsonPath("$.coins[0].symbol").value("btc"));
        }
    }

    @Nested
    @DisplayName("GET /api/market/coins/{coinId}")
    class GetCoinDetail {

        @Test
        @DisplayName("코인 상세 조회 성공")
        void success() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/markets"))
                    .withQueryParam("ids", containing("bitcoin"))
                    .willReturn(okJson(coinsMarketsJson(BITCOIN_MARKET_JSON))));

            // when & then
            mockMvc.perform(get("/api/market/coins/bitcoin"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value("bitcoin"))
                    .andExpect(jsonPath("$.symbol").value("btc"))
                    .andExpect(jsonPath("$.name").value("Bitcoin"))
                    .andExpect(jsonPath("$.current_price").value(97500.25));
        }

        @Test
        @DisplayName("존재하지 않는 코인 조회 시 404 에러")
        void coinNotFound_returns404() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/markets"))
                    .withQueryParam("ids", containing("unknown"))
                    .willReturn(okJson(EMPTY_ARRAY_JSON)));

            // when & then
            mockMvc.perform(get("/api/market/coins/unknown-coin"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("COIN_NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("GET /api/market/coins/{coinId}/ohlcv")
    class GetOhlcv {

        @Test
        @DisplayName("OHLCV 조회 성공")
        void success() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                    .willReturn(okJson(OHLC_DATA_JSON)));

            // when & then
            mockMvc.perform(get("/api/market/coins/bitcoin/ohlcv")
                            .param("timeframe", "1d"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.coinId").value("bitcoin"))
                    .andExpect(jsonPath("$.timeframe").value("1d"))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(3))
                    .andExpect(jsonPath("$.data[0].timestamp").value(1709395200000L))
                    .andExpect(jsonPath("$.data[0].open").value(61942))
                    .andExpect(jsonPath("$.data[0].high").value(62211))
                    .andExpect(jsonPath("$.data[0].low").value(61721))
                    .andExpect(jsonPath("$.data[0].close").value(61845));
        }

        @Test
        @DisplayName("잘못된 timeframe 시 400 에러")
        void invalidTimeframe_returns400() throws Exception {
            mockMvc.perform(get("/api/market/coins/bitcoin/ohlcv")
                            .param("timeframe", "invalid"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("1h 타임프레임 조회 성공")
        void oneHourTimeframe_success() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                    .withQueryParam("days", equalTo("1"))
                    .willReturn(okJson(OHLC_SINGLE_JSON)));

            // when & then
            mockMvc.perform(get("/api/market/coins/bitcoin/ohlcv")
                            .param("timeframe", "1h"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.timeframe").value("1h"));
        }

        @Test
        @DisplayName("1w 타임프레임 조회 성공")
        void oneWeekTimeframe_success() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                    .withQueryParam("days", equalTo("90"))
                    .willReturn(okJson(OHLC_SINGLE_JSON)));

            // when & then
            mockMvc.perform(get("/api/market/coins/bitcoin/ohlcv")
                            .param("timeframe", "1w"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.timeframe").value("1w"));
        }
    }
}
