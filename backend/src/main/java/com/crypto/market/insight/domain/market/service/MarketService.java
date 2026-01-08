package com.crypto.market.insight.domain.market.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.MarketChartData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MarketService {

    private static final String DEFAULT_VS_CURRENCY = "usd";

    private final CoinGeckoClient coinGeckoClient;

    public List<CoinMarketData> getCoins(int page, int size, String keyword) {
        List<CoinMarketData> coins = coinGeckoClient.getCoinsMarkets(DEFAULT_VS_CURRENCY, null, size, page);

        if (keyword == null || keyword.isBlank()) {
            return coins;
        }

        String lowerKeyword = keyword.toLowerCase();
        return coins.stream()
                .filter(coin -> coin.symbol().toLowerCase().contains(lowerKeyword)
                        || coin.name().toLowerCase().contains(lowerKeyword))
                .toList();
    }

    public CoinMarketData getCoinDetail(String coinId) {
        List<CoinMarketData> result = coinGeckoClient.getCoinsMarkets(DEFAULT_VS_CURRENCY, coinId);
        if (result.isEmpty()) {
            throw new BusinessException(ErrorCode.COIN_NOT_FOUND);
        }
        return result.getFirst();
    }

    public Timeframe parseTimeframe(String timeframe) {
        Timeframe tf = Timeframe.fromValue(timeframe);
        if (tf == null) {
            String validValues = Arrays.stream(Timeframe.values())
                    .map(Timeframe::getValue)
                    .collect(Collectors.joining(", "));
            throw new BusinessException(ErrorCode.INVALID_PARAMETER,
                    "Invalid timeframe: " + timeframe + ". Valid values: " + validValues);
        }
        return tf;
    }

    public List<OhlcvData> getOhlcv(String coinId, Timeframe timeframe) {
        return getOhlcv(coinId, timeframe.getDays());
    }

    public List<OhlcvData> getOhlcv(String coinId, String days) {
        List<OhlcData> ohlcList = coinGeckoClient.getOhlc(coinId, DEFAULT_VS_CURRENCY, days);
        MarketChartData marketChart = coinGeckoClient.getMarketChart(coinId, DEFAULT_VS_CURRENCY, days);

        Map<Long, BigDecimal> volumeMap = buildVolumeMap(marketChart);

        return ohlcList.stream()
                .map(ohlc -> {
                    BigDecimal volume = findNearestVolume(ohlc.timestamp(), volumeMap);
                    return OhlcvData.from(ohlc, volume);
                })
                .toList();
    }

    private Map<Long, BigDecimal> buildVolumeMap(MarketChartData marketChart) {
        if (marketChart == null || marketChart.totalVolumes() == null) {
            return Map.of();
        }
        return marketChart.totalVolumes().stream()
                .collect(Collectors.toMap(
                        v -> v.get(0).longValue(),
                        v -> BigDecimal.valueOf(v.get(1).doubleValue()),
                        (v1, v2) -> v2
                ));
    }

    private BigDecimal findNearestVolume(Long timestamp, Map<Long, BigDecimal> volumeMap) {
        if (volumeMap.isEmpty()) {
            return null;
        }

        // 정확히 일치하는 경우
        if (volumeMap.containsKey(timestamp)) {
            return volumeMap.get(timestamp);
        }

        // 가장 가까운 timestamp 찾기 (1시간 범위 내)
        long tolerance = 3600000L; // 1 hour
        return volumeMap.entrySet().stream()
                .filter(e -> Math.abs(e.getKey() - timestamp) <= tolerance)
                .min((e1, e2) -> Long.compare(
                        Math.abs(e1.getKey() - timestamp),
                        Math.abs(e2.getKey() - timestamp)))
                .map(Map.Entry::getValue)
                .orElse(null);
    }
}
