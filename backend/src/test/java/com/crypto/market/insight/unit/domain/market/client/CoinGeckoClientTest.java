package com.crypto.market.insight.unit.domain.market.client;

import static com.crypto.market.insight.support.fixture.MarketFixture.*;
import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.exception.CoinGeckoApiException;
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo;
import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

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
                .willReturn(okJson(coinsMarketsJson(BITCOIN_MARKET_JSON, ETHEREUM_MARKET_JSON))));

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
                .willReturn(okJson(EMPTY_ARRAY_JSON)));

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
                .willReturn(okJson(OHLC_DATA_JSON)));

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
                .willReturn(okJson(EMPTY_ARRAY_JSON)));

        // when
        List<OhlcData> result = client.getOhlc("bitcoin", "usd", "1");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getCoinsMarkets - 타임아웃 시 CoinGeckoApiException 발생")
    void getCoinsMarkets_timeout_throwsException(WireMockRuntimeInfo wmRuntimeInfo) {
        // given
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(100);
        factory.setReadTimeout(100);

        RestClient timeoutClient = RestClient.builder()
                .baseUrl(wmRuntimeInfo.getHttpBaseUrl())
                .requestFactory(factory)
                .build();
        CoinGeckoClient clientWithTimeout = new CoinGeckoClient(timeoutClient);

        stubFor(get(urlPathEqualTo("/coins/markets"))
                .willReturn(ok().withFixedDelay(500)));

        // when & then
        assertThatThrownBy(() -> clientWithTimeout.getCoinsMarkets("usd", "bitcoin"))
                .isInstanceOf(CoinGeckoApiException.class)
                .satisfies(ex -> {
                    CoinGeckoApiException e = (CoinGeckoApiException) ex;
                    assertThat(e.getErrorCode()).isEqualTo(ErrorCode.COINGECKO_TIMEOUT);
                });
    }
}
