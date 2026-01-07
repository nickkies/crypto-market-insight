package com.crypto.market.insight.domain.strategy.indicator;

import static com.crypto.market.insight.support.fixture.MarketFixture.ohlcvFromPrices;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiAllGainsCandles;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiAllLossesCandles;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiBalancedCandles;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiTestCandles;
import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IndicatorCalculatorTest {

    private final IndicatorCalculator calculator = new IndicatorCalculator();

    @Test
    @DisplayName("RSI 계산 - 데이터가 부족하면 빈 리스트 반환")
    void calculateRsi_insufficientData_returnsEmptyList() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0);

        List<BigDecimal> rsi = calculator.calculateRsi(candles, 14);

        assertThat(rsi).isEmpty();
    }

    @Test
    @DisplayName("RSI 계산 - null 입력시 빈 리스트 반환")
    void calculateRsi_nullInput_returnsEmptyList() {
        List<BigDecimal> rsi = calculator.calculateRsi(null, 14);

        assertThat(rsi).isEmpty();
    }

    @Test
    @DisplayName("RSI 계산 - 첫 period-1개는 null")
    void calculateRsi_firstValuesAreNull() {
        List<OhlcvData> candles = rsiTestCandles();

        List<BigDecimal> rsi = calculator.calculateRsi(candles, 14);

        assertThat(rsi).hasSize(15);
        for (int i = 0; i < 13; i++) {
            assertThat(rsi.get(i)).isNull();
        }
        assertThat(rsi.get(13)).isNotNull();
    }

    @Test
    @DisplayName("RSI 계산 - 모두 상승시 RSI 100")
    void calculateRsi_allGains_returns100() {
        List<OhlcvData> candles = rsiAllGainsCandles();

        List<BigDecimal> rsi = calculator.calculateRsi(candles, 5);

        assertThat(rsi.get(rsi.size() - 1)).isEqualByComparingTo(BigDecimal.valueOf(100));
    }

    @Test
    @DisplayName("RSI 계산 - 모두 하락시 RSI 0")
    void calculateRsi_allLosses_returns0() {
        List<OhlcvData> candles = rsiAllLossesCandles();

        List<BigDecimal> rsi = calculator.calculateRsi(candles, 5);

        assertThat(rsi.get(rsi.size() - 1)).isEqualByComparingTo(BigDecimal.valueOf(0));
    }

    @Test
    @DisplayName("RSI 계산 - 상승/하락 균형시 RSI 50 근처")
    void calculateRsi_balanced_returnsAround50() {
        List<OhlcvData> candles = rsiBalancedCandles();

        List<BigDecimal> rsi = calculator.calculateRsi(candles, 5);

        BigDecimal lastRsi = rsi.get(rsi.size() - 1);
        assertThat(lastRsi.doubleValue()).isBetween(40.0, 60.0);
    }
}
