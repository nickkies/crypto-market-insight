package com.crypto.market.insight.domain.market.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.client.CoinGeckoClient;
import com.crypto.market.insight.domain.market.dto.CoinMarketData;
import com.crypto.market.insight.domain.market.dto.OhlcData;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MarketService {

    private static final String DEFAULT_VS_CURRENCY = "usd";
    private static final Set<String> VALID_TIMEFRAMES = Set.of("1h", "4h", "1d", "1w");

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

    public List<OhlcData> getOhlcv(String coinId, String timeframe) {
        validateTimeframe(timeframe);
        String days = convertTimeframeToDays(timeframe);
        return coinGeckoClient.getOhlc(coinId, DEFAULT_VS_CURRENCY, days);
    }

    private void validateTimeframe(String timeframe) {
        if (!VALID_TIMEFRAMES.contains(timeframe)) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER,
                    "Invalid timeframe: " + timeframe + ". Valid values: " + VALID_TIMEFRAMES);
        }
    }

    private String convertTimeframeToDays(String timeframe) {
        return switch (timeframe) {
            case "1h", "4h" -> "1";
            case "1w" -> "90";
            default -> "30";    // 1d
        };
    }
}
