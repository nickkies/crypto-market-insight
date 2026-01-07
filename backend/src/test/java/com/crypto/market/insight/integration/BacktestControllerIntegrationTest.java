package com.crypto.market.insight.integration;

import static com.crypto.market.insight.support.fixture.MarketFixture.*;
import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class BacktestControllerIntegrationTest {

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
    @DisplayName("POST /api/backtests")
    class RunBacktest {

        private static final String BACKTEST_OHLC_JSON = """
                [
                    [1709222400000, 61000, 61500, 60500, 61200],
                    [1709308800000, 61200, 62000, 61000, 61800],
                    [1709395200000, 61800, 62500, 61500, 62300],
                    [1709481600000, 62300, 63000, 62000, 62800],
                    [1709568000000, 62800, 63500, 62500, 63200],
                    [1709654400000, 63200, 64000, 63000, 63800],
                    [1709740800000, 63800, 64500, 63500, 64200],
                    [1709827200000, 64200, 65000, 64000, 64800],
                    [1709913600000, 64800, 65500, 64500, 65200],
                    [1710000000000, 65200, 66000, 65000, 65800],
                    [1710086400000, 65800, 66500, 65500, 66200],
                    [1710172800000, 66200, 67000, 66000, 66800],
                    [1710259200000, 66800, 67500, 66500, 67200],
                    [1710345600000, 67200, 68000, 67000, 67800],
                    [1710432000000, 67800, 68500, 67500, 68200],
                    [1710518400000, 68200, 69000, 68000, 68800],
                    [1710604800000, 68800, 69500, 68500, 69200],
                    [1710691200000, 69200, 70000, 69000, 69800]
                ]
                """;

        private static final String BACKTEST_MARKET_CHART_JSON = """
                {
                    "prices": [],
                    "market_caps": [],
                    "total_volumes": []
                }
                """;

        @Test
        @DisplayName("백테스트 실행 성공")
        void success() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                    .willReturn(okJson(BACKTEST_OHLC_JSON)));
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/market_chart"))
                    .willReturn(okJson(BACKTEST_MARKET_CHART_JSON)));

            String requestBody = """
                    {
                        "coinId": "bitcoin",
                        "strategyType": "RSI",
                        "parameters": {
                            "period": 14,
                            "oversold": 30,
                            "overbought": 70
                        },
                        "timeframe": "1d"
                    }
                    """;

            // when & then
            mockMvc.perform(post("/api/backtests")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.coinId").value("bitcoin"))
                    .andExpect(jsonPath("$.strategyType").value("RSI"))
                    .andExpect(jsonPath("$.metrics").exists())
                    .andExpect(jsonPath("$.metrics.cumulativeReturn").exists())
                    .andExpect(jsonPath("$.metrics.mdd").exists())
                    .andExpect(jsonPath("$.metrics.winRate").exists())
                    .andExpect(jsonPath("$.metrics.tradeCount").exists());
        }

        @Test
        @DisplayName("필수 파라미터 누락 시 400 에러")
        void missingParameter_returns400() throws Exception {
            String requestBody = """
                    {
                        "coinId": "bitcoin",
                        "strategyType": "RSI"
                    }
                    """;

            mockMvc.perform(post("/api/backtests")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));
        }

        @Test
        @DisplayName("oversold >= overbought 시 400 에러")
        void invalidOversoldOverbought_returns400() throws Exception {
            // given
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                    .willReturn(okJson(BACKTEST_OHLC_JSON)));
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/market_chart"))
                    .willReturn(okJson(BACKTEST_MARKET_CHART_JSON)));

            String requestBody = """
                    {
                        "coinId": "bitcoin",
                        "strategyType": "RSI",
                        "parameters": {
                            "period": 14,
                            "oversold": 70,
                            "overbought": 30
                        },
                        "timeframe": "1d"
                    }
                    """;

            mockMvc.perform(post("/api/backtests")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_STRATEGY_PARAMS"));
        }

        @Test
        @DisplayName("period 범위 초과 시 400 에러")
        void invalidPeriod_returns400() throws Exception {
            String requestBody = """
                    {
                        "coinId": "bitcoin",
                        "strategyType": "RSI",
                        "parameters": {
                            "period": 150,
                            "oversold": 30,
                            "overbought": 70
                        },
                        "timeframe": "1d"
                    }
                    """;

            mockMvc.perform(post("/api/backtests")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"));
        }
    }

    @Nested
    @DisplayName("GET /api/backtests/{id}")
    class GetBacktest {

        @Test
        @DisplayName("존재하지 않는 백테스트 조회 시 404 에러")
        void notFound_returns404() throws Exception {
            mockMvc.perform(get("/api/backtests/99999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("BACKTEST_NOT_FOUND"));
        }

        @Test
        @DisplayName("백테스트 실행 후 결과 조회 성공")
        void runAndGet_success() throws Exception {
            // given - 백테스트 실행
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                    .willReturn(okJson(RunBacktest.BACKTEST_OHLC_JSON)));
            stubFor(com.github.tomakehurst.wiremock.client.WireMock.get(urlPathEqualTo("/coins/bitcoin/market_chart"))
                    .willReturn(okJson(RunBacktest.BACKTEST_MARKET_CHART_JSON)));

            String requestBody = """
                    {
                        "coinId": "bitcoin",
                        "strategyType": "RSI",
                        "parameters": {
                            "period": 14,
                            "oversold": 30,
                            "overbought": 70
                        },
                        "timeframe": "1d"
                    }
                    """;

            MvcResult result = mockMvc.perform(post("/api/backtests")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isOk())
                    .andReturn();

            String responseBody = result.getResponse().getContentAsString();
            Long id = com.jayway.jsonpath.JsonPath.parse(responseBody).read("$.id", Long.class);

            // when & then - 결과 조회
            mockMvc.perform(get("/api/backtests/" + id))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id))
                    .andExpect(jsonPath("$.coinId").value("bitcoin"))
                    .andExpect(jsonPath("$.strategyType").value("RSI"));
        }
    }
}
