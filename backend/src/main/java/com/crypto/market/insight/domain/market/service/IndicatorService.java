package com.crypto.market.insight.domain.market.service;

import com.crypto.market.insight.config.CacheConfig;
import com.crypto.market.insight.domain.market.dto.IndicatorDto.BollingerBandsIndicator;
import com.crypto.market.insight.domain.market.dto.IndicatorDto.IndicatorResponse;
import com.crypto.market.insight.domain.market.dto.IndicatorDto.MacdIndicator;
import com.crypto.market.insight.domain.market.dto.IndicatorDto.MaIndicator;
import com.crypto.market.insight.domain.market.dto.IndicatorDto.RsiIndicator;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator.BollingerBandsResult;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator.MacdResult;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IndicatorService {

    private static final int RSI_PERIOD = 14;
    private static final int MA_SHORT_PERIOD = 20;
    private static final int MA_LONG_PERIOD = 50;
    private static final int MACD_FAST = 12;
    private static final int MACD_SLOW = 26;
    private static final int MACD_SIGNAL = 9;
    private static final int BB_PERIOD = 20;
    private static final double BB_STD_DEV = 2.0;

    private final MarketService marketService;
    private final IndicatorCalculator indicatorCalculator;

    @Cacheable(value = CacheConfig.INDICATORS, key = "#coinId + '-' + #period")
    public IndicatorResponse calculateIndicators(String coinId, int period) {
        // OHLCV 데이터 조회 (period 일수)
        List<OhlcvData> candles = marketService.getOhlcv(coinId, String.valueOf(period));

        // RSI 계산
        RsiIndicator rsi = calculateRsi(candles);

        // MACD 계산
        MacdIndicator macd = calculateMacd(candles);

        // MA 계산
        MaIndicator ma = calculateMa(candles);

        // Bollinger Bands 계산
        BollingerBandsIndicator bb = calculateBollingerBands(candles);

        return IndicatorResponse.of(coinId, rsi, macd, ma, bb);
    }

    private RsiIndicator calculateRsi(List<OhlcvData> candles) {
        List<BigDecimal> rsiValues = indicatorCalculator.calculateRsi(candles, RSI_PERIOD);
        BigDecimal latestRsi = getLatestNonNull(rsiValues);
        return RsiIndicator.of(latestRsi);
    }

    private MacdIndicator calculateMacd(List<OhlcvData> candles) {
        MacdResult result = indicatorCalculator.calculateMacd(candles, MACD_FAST, MACD_SLOW, MACD_SIGNAL);
        BigDecimal macd = getLatestNonNull(result.macdLine());
        BigDecimal signal = getLatestNonNull(result.signalLine());
        BigDecimal histogram = getLatestNonNull(result.histogram());
        return MacdIndicator.of(macd, signal, histogram);
    }

    private MaIndicator calculateMa(List<OhlcvData> candles) {
        List<BigDecimal> ma20Values = indicatorCalculator.calculateSma(candles, MA_SHORT_PERIOD);
        List<BigDecimal> ma50Values = indicatorCalculator.calculateSma(candles, MA_LONG_PERIOD);
        BigDecimal ma20 = getLatestNonNull(ma20Values);
        BigDecimal ma50 = getLatestNonNull(ma50Values);
        return MaIndicator.of(ma20, ma50);
    }

    private BollingerBandsIndicator calculateBollingerBands(List<OhlcvData> candles) {
        BollingerBandsResult result = indicatorCalculator.calculateBollingerBands(candles, BB_PERIOD, BB_STD_DEV);
        BigDecimal upper = getLatestNonNull(result.upper());
        BigDecimal middle = getLatestNonNull(result.middle());
        BigDecimal lower = getLatestNonNull(result.lower());
        return BollingerBandsIndicator.of(upper, middle, lower);
    }

    private BigDecimal getLatestNonNull(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        for (int i = values.size() - 1; i >= 0; i--) {
            if (values.get(i) != null) {
                return values.get(i);
            }
        }
        return null;
    }
}
