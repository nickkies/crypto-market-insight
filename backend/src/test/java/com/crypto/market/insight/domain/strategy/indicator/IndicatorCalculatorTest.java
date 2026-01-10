package com.crypto.market.insight.domain.strategy.indicator;

import static com.crypto.market.insight.support.fixture.MarketFixture.ohlcvFromPrices;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiAllGainsCandles;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiAllLossesCandles;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiBalancedCandles;
import static com.crypto.market.insight.support.fixture.MarketFixture.rsiTestCandles;
import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator.BollingerBandsResult;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator.MacdResult;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

    @Nested
    @DisplayName("SMA 계산")
    class CalculateSma {

        @Test
        @DisplayName("데이터가 부족하면 빈 리스트 반환")
        void insufficientData_returnsEmptyList() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0);

            List<BigDecimal> sma = calculator.calculateSma(candles, 5);

            assertThat(sma).isEmpty();
        }

        @Test
        @DisplayName("첫 period-1개는 null")
        void firstValuesAreNull() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0, 105.0);

            List<BigDecimal> sma = calculator.calculateSma(candles, 5);

            assertThat(sma).hasSize(6);
            for (int i = 0; i < 4; i++) {
                assertThat(sma.get(i)).isNull();
            }
            assertThat(sma.get(4)).isNotNull();
        }

        @Test
        @DisplayName("SMA 정확한 계산 검증")
        void correctCalculation() {
            // 100, 102, 104, 106, 108 -> SMA(5) = 104
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 102.0, 104.0, 106.0, 108.0);

            List<BigDecimal> sma = calculator.calculateSma(candles, 5);

            assertThat(sma.get(4)).isEqualByComparingTo(BigDecimal.valueOf(104.00));
        }
    }

    @Nested
    @DisplayName("EMA 계산")
    class CalculateEma {

        @Test
        @DisplayName("데이터가 부족하면 빈 리스트 반환")
        void insufficientData_returnsEmptyList() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0);

            List<BigDecimal> ema = calculator.calculateEma(candles, 5);

            assertThat(ema).isEmpty();
        }

        @Test
        @DisplayName("첫 EMA는 SMA와 동일")
        void firstEmaEqualsSma() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 102.0, 104.0, 106.0, 108.0);

            List<BigDecimal> ema = calculator.calculateEma(candles, 5);

            // 첫 EMA = SMA = (100+102+104+106+108)/5 = 104
            assertThat(ema.get(4)).isEqualByComparingTo(BigDecimal.valueOf(104.00));
        }

        @Test
        @DisplayName("EMA가 SMA보다 최신 가격에 민감")
        void emaMoreSensitiveToRecentPrices() {
            List<OhlcvData> candles = ohlcvFromPrices(
                    100.0, 100.0, 100.0, 100.0, 100.0, 150.0
            );

            List<BigDecimal> sma = calculator.calculateSma(candles, 5);
            List<BigDecimal> ema = calculator.calculateEma(candles, 5);

            // 급등 시 EMA가 SMA보다 더 높아야 함
            BigDecimal lastSma = sma.get(sma.size() - 1);
            BigDecimal lastEma = ema.get(ema.size() - 1);
            assertThat(lastEma).isGreaterThan(lastSma);
        }
    }

    @Nested
    @DisplayName("MACD 계산")
    class CalculateMacd {

        @Test
        @DisplayName("데이터가 부족하면 빈 결과 반환")
        void insufficientData_returnsEmptyResult() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0);

            MacdResult result = calculator.calculateMacd(candles, 12, 26, 9);

            assertThat(result.macdLine()).isEmpty();
            assertThat(result.signalLine()).isEmpty();
            assertThat(result.histogram()).isEmpty();
        }

        @Test
        @DisplayName("충분한 데이터로 MACD 계산")
        void sufficientData_calculatesCorrectly() {
            // 40개 데이터 (26 + 9 = 35 최소 필요)
            double[] prices = new double[40];
            for (int i = 0; i < 40; i++) {
                prices[i] = 100.0 + i;
            }
            List<OhlcvData> candles = ohlcvFromPrices(prices);

            MacdResult result = calculator.calculateMacd(candles, 12, 26, 9);

            // MACD Line의 마지막 값이 존재
            assertThat(result.macdLine()).isNotEmpty();
            BigDecimal lastMacd = result.macdLine().get(result.macdLine().size() - 1);
            assertThat(lastMacd).isNotNull();

            // 상승 추세에서 MACD는 양수
            assertThat(lastMacd).isGreaterThan(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("Bollinger Bands 계산")
    class CalculateBollingerBands {

        @Test
        @DisplayName("데이터가 부족하면 빈 결과 반환")
        void insufficientData_returnsEmptyResult() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0);

            BollingerBandsResult result = calculator.calculateBollingerBands(candles, 20, 2.0);

            assertThat(result.upper()).isEmpty();
            assertThat(result.middle()).isEmpty();
            assertThat(result.lower()).isEmpty();
        }

        @Test
        @DisplayName("중간 밴드는 SMA와 동일")
        void middleBandEqualsSma() {
            double[] prices = new double[25];
            for (int i = 0; i < 25; i++) {
                prices[i] = 100.0 + i;
            }
            List<OhlcvData> candles = ohlcvFromPrices(prices);

            BollingerBandsResult bb = calculator.calculateBollingerBands(candles, 20, 2.0);
            List<BigDecimal> sma = calculator.calculateSma(candles, 20);

            // 마지막 값 비교
            assertThat(bb.middle().get(bb.middle().size() - 1))
                    .isEqualByComparingTo(sma.get(sma.size() - 1));
        }

        @Test
        @DisplayName("upper > middle > lower 관계")
        void bandsOrdering() {
            double[] prices = new double[25];
            for (int i = 0; i < 25; i++) {
                prices[i] = 100.0 + (i % 2 == 0 ? 5 : -5);
            }
            List<OhlcvData> candles = ohlcvFromPrices(prices);

            BollingerBandsResult result = calculator.calculateBollingerBands(candles, 20, 2.0);

            int lastIndex = result.upper().size() - 1;
            BigDecimal upper = result.upper().get(lastIndex);
            BigDecimal middle = result.middle().get(lastIndex);
            BigDecimal lower = result.lower().get(lastIndex);

            assertThat(upper).isGreaterThan(middle);
            assertThat(middle).isGreaterThan(lower);
        }

        @Test
        @DisplayName("변동성 없으면 밴드 간격 0")
        void noVolatility_zeroBandWidth() {
            // 모든 가격이 동일
            double[] prices = new double[25];
            for (int i = 0; i < 25; i++) {
                prices[i] = 100.0;
            }
            List<OhlcvData> candles = ohlcvFromPrices(prices);

            BollingerBandsResult result = calculator.calculateBollingerBands(candles, 20, 2.0);

            int lastIndex = result.upper().size() - 1;
            assertThat(result.upper().get(lastIndex))
                    .isEqualByComparingTo(result.middle().get(lastIndex));
            assertThat(result.lower().get(lastIndex))
                    .isEqualByComparingTo(result.middle().get(lastIndex));
        }
    }
}
