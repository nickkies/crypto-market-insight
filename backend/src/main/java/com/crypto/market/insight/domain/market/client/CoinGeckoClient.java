package com.crypto.market.insight.domain.market.client;

import com.crypto.market.insight.config.CacheConfig;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.GlobalStatsDto.CoinGeckoGlobalResponse;
import com.crypto.market.insight.domain.market.dto.MarketChartData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.exception.CoinGeckoApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.function.Supplier;

@Slf4j
@Component
@RequiredArgsConstructor
public class CoinGeckoClient {

    private static final String COINS_MARKETS_PATH = "/coins/markets";
    private static final String OHLC_PATH = "/coins/{id}/ohlc";
    private static final String MARKET_CHART_PATH = "/coins/{id}/market_chart";
    private static final String GLOBAL_PATH = "/global";

    private final RestClient coinGeckoRestClient;

    /**
     * 코인 마켓 데이터 조회
     *
     * @param vsCurrency 기준 통화 (예: "usd", "krw")
     * @param ids        코인 ID 목록 (예: "bitcoin,ethereum")
     * @param category   카테고리 ID (예: "layer-1", "meme-token")
     * @param perPage    페이지당 개수 (최대 250)
     * @param page       페이지 번호
     * @return 코인 마켓 데이터 목록
     */
    @Cacheable(value = CacheConfig.COIN_MARKETS, key = "#vsCurrency + ':' + #ids + ':' + #category + ':' + #perPage + ':' + #page")
    public List<CoinMarketData> getCoinsMarkets(String vsCurrency, String ids, String category, int perPage, int page) {
        log.info("Cache MISS - fetching coinMarkets: vsCurrency={}, ids={}, category={}", vsCurrency, ids, category);
        return execute(() -> {
            CoinMarketData[] response = coinGeckoRestClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder
                                .path(COINS_MARKETS_PATH)
                                .queryParam("vs_currency", vsCurrency)
                                .queryParam("per_page", perPage)
                                .queryParam("page", page);
                        if (ids != null && !ids.isBlank()) {
                            uriBuilder.queryParam("ids", ids);
                        }
                        if (category != null && !category.isBlank()) {
                            uriBuilder.queryParam("category", category);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(CoinMarketData[].class);

            return response != null ? List.of(response) : List.of();
        });
    }

    /**
     * 코인 마켓 데이터 조회 (category 없이)
     */
    public List<CoinMarketData> getCoinsMarkets(String vsCurrency, String ids, int perPage, int page) {
        return getCoinsMarkets(vsCurrency, ids, null, perPage, page);
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
    @Cacheable(value = CacheConfig.OHLC, key = "#coinId + ':' + #vsCurrency + ':' + #days")
    public List<OhlcData> getOhlc(String coinId, String vsCurrency, String days) {
        log.info("Cache MISS - fetching OHLC: coinId={}, vsCurrency={}, days={}", coinId, vsCurrency, days);
        return execute(() -> {
            OhlcData[] response = coinGeckoRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(OHLC_PATH)
                            .queryParam("vs_currency", vsCurrency)
                            .queryParam("days", days)
                            .build(coinId))
                    .retrieve()
                    .body(OhlcData[].class);

            return response != null ? List.of(response) : List.of();
        });
    }

    /**
     * 마켓 차트 데이터 조회 (가격, 시가총액, 거래량)
     *
     * @param coinId     코인 ID (예: "bitcoin")
     * @param vsCurrency 기준 통화 (예: "usd")
     * @param days       조회 기간 (1, 7, 14, 30, 90, 180, 365, "max")
     * @return 마켓 차트 데이터
     */
    @Cacheable(value = CacheConfig.OHLC, key = "'chart:' + #coinId + ':' + #vsCurrency + ':' + #days")
    public MarketChartData getMarketChart(String coinId, String vsCurrency, String days) {
        log.info("Cache MISS - fetching MarketChart: coinId={}, vsCurrency={}, days={}", coinId, vsCurrency, days);
        return execute(() -> coinGeckoRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(MARKET_CHART_PATH)
                        .queryParam("vs_currency", vsCurrency)
                        .queryParam("days", days)
                        .build(coinId))
                .retrieve()
                .body(MarketChartData.class));
    }

    /**
     * 글로벌 시장 통계 조회
     *
     * @return 글로벌 시장 데이터 (총 시가총액, 거래량, BTC 도미넌스 등)
     */
    @Cacheable(value = CacheConfig.GLOBAL_STATS)
    public CoinGeckoGlobalResponse getGlobal() {
        log.info("Cache MISS - fetching Global stats");
        return execute(() -> coinGeckoRestClient.get()
                .uri(GLOBAL_PATH)
                .retrieve()
                .body(CoinGeckoGlobalResponse.class));
    }

    private <T> T execute(Supplier<T> request) {
        try {
            return request.get();
        } catch (ResourceAccessException e) {
            log.error("CoinGecko Timeout: {}", e.getMessage());
            throw CoinGeckoApiException.timeout(e);
        }
    }
}
