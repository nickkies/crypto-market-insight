package com.crypto.market.insight.domain.market.client;

import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo;
import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@WireMockTest
class CoinGeckoClientTest {

    private CoinGeckoClient client;

    @BeforeEach
    void setUp(WireMockRuntimeInfo wmRuntimeInfo) {
        RestClient restClient = RestClient.builder()
                .baseUrl(wmRuntimeInfo.getHttpBaseUrl())
                .build();
        client = new CoinGeckoClient(restClient);
    }

    @Test
    @DisplayName("getCoinsMarkets - 코인 마켓 데이터를 조회한다")
    void getCoinsMarkets_returnsMarketData() {
        // given
        stubFor(get(urlPathEqualTo("/coins/markets"))
                .withQueryParam("vs_currency", equalTo("usd"))
                .withQueryParam("ids", equalTo("bitcoin,ethereum"))
                .withQueryParam("per_page", equalTo("100"))
                .withQueryParam("page", equalTo("1"))
                .willReturn(okJson("""
                        [
                            {
                                "id": "bitcoin",
                                "symbol": "btc",
                                "name": "Bitcoin",
                                "current_price": 97500.25,
                                "market_cap": 1930000000000,
                                "market_cap_rank": 1
                            },
                            {
                                "id": "ethereum",
                                "symbol": "eth",
                                "name": "Ethereum",
                                "current_price": 3400.50,
                                "market_cap": 410000000000,
                                "market_cap_rank": 2
                            }
                        ]
                        """)));

        // when
        List<CoinMarketData> result = client.getCoinsMarkets("usd", "bitcoin,ethereum");

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo("bitcoin");
        assertThat(result.get(0).symbol()).isEqualTo("btc");
        assertThat(result.get(1).id()).isEqualTo("ethereum");
    }

    @Test
    @DisplayName("getCoinsMarkets - 빈 응답을 처리한다")
    void getCoinsMarkets_emptyResponse() {
        // given
        stubFor(get(urlPathEqualTo("/coins/markets"))
                .willReturn(okJson("[]")));

        // when
        List<CoinMarketData> result = client.getCoinsMarkets("usd", "unknown");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getOhlc - OHLC 데이터를 조회한다")
    void getOhlc_returnsOhlcData() {
        // given
        stubFor(get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                .withQueryParam("vs_currency", equalTo("usd"))
                .withQueryParam("days", equalTo("7"))
                .willReturn(okJson("""
                        [
                            [1709395200000, 61942, 62211, 61721, 61845],
                            [1709409600000, 61828, 62139, 61726, 62139],
                            [1709424000000, 62171, 62210, 61821, 62068]
                        ]
                        """)));

        // when
        List<OhlcData> result = client.getOhlc("bitcoin", "usd", "7");

        // then
        assertThat(result).hasSize(3);
        assertThat(result.getFirst().timestamp()).isEqualTo(1709395200000L);
        assertThat(result.getFirst().open()).isEqualByComparingTo("61942");
        assertThat(result.getFirst().close()).isEqualByComparingTo("61845");
    }

    @Test
    @DisplayName("getOhlc - 빈 응답을 처리한다")
    void getOhlc_emptyResponse() {
        // given
        stubFor(get(urlPathEqualTo("/coins/bitcoin/ohlc"))
                .willReturn(okJson("[]")));

        // when
        List<OhlcData> result = client.getOhlc("bitcoin", "usd", "1");

        // then
        assertThat(result).isEmpty();
    }
}
