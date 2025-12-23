package com.crypto.market.insight.domain.market.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import com.crypto.market.insight.domain.market.model.vo.Timeframe;
import java.util.Arrays;
import java.util.List;
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

    public List<OhlcData> getOhlcv(String coinId, Timeframe timeframe) {
        return coinGeckoClient.getOhlc(coinId, DEFAULT_VS_CURRENCY, timeframe.getDays());
    }
}
