package com.crypto.market.insight.domain.market.client;

import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CoinGeckoClient {

    private static final String COINS_MARKETS_PATH = "/coins/markets";
    private static final String OHLC_PATH = "/coins/{id}/ohlc";

    private final RestClient coinGeckoRestClient;

    /**
     * 코인 마켓 데이터 조회
     *
     * @param vsCurrency 기준 통화 (예: "usd", "krw")
     * @param ids        코인 ID 목록 (예: "bitcoin,ethereum")
     * @param perPage    페이지당 개수 (최대 250)
     * @param page       페이지 번호
     * @return 코인 마켓 데이터 목록
     */
    public List<CoinMarketData> getCoinsMarkets(String vsCurrency, String ids, int perPage, int page) {
        CoinMarketData[] response = coinGeckoRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(COINS_MARKETS_PATH)
                        .queryParam("vs_currency", vsCurrency)
                        .queryParam("ids", ids)
                        .queryParam("per_page", perPage)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(CoinMarketData[].class);

        return response != null ? List.of(response) : List.of();
    }

    /**
     * 코인 마켓 데이터 조회 (기본값)
     *
     * @param vsCurrency 기준 통화
     * @param ids        코인 ID 목록
     * @return 코인 마켓 데이터 목록
     */
    public List<CoinMarketData> getCoinsMarkets(String vsCurrency, String ids) {
        return getCoinsMarkets(vsCurrency, ids, 100, 1);
    }

    /**
     * OHLC(시가, 고가, 저가, 종가) 데이터 조회
     *
     * @param coinId     코인 ID (예: "bitcoin")
     * @param vsCurrency 기준 통화 (예: "usd")
     * @param days       조회 기간 (1, 7, 14, 30, 90, 180, 365, "max")
     * @return OHLC 데이터 목록
     */
    public List<OhlcData> getOhlc(String coinId, String vsCurrency, String days) {
        OhlcData[] response = coinGeckoRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(OHLC_PATH)
                        .queryParam("vs_currency", vsCurrency)
                        .queryParam("days", days)
                        .build(coinId))
                .retrieve()
                .body(OhlcData[].class);

        return response != null ? List.of(response) : List.of();
    }
}
