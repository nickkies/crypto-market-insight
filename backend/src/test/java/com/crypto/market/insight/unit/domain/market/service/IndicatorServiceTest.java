package com.crypto.market.insight.unit.domain.market.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.crypto.market.insight.domain.market.dto.IndicatorDto.IndicatorResponse;
import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.market.service.IndicatorService;
import com.crypto.market.insight.domain.market.service.MarketService;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator.BollingerBandsResult;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator.MacdResult;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class IndicatorServiceTest {

    @Mock
    private MarketService marketService;

    @Mock
    private IndicatorCalculator indicatorCalculator;

    @InjectMocks
    private IndicatorService indicatorService;

    private List<OhlcvData> createMockCandles(int count) {
        List<OhlcvData> candles = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            candles.add(new OhlcvData(
                    System.currentTimeMillis() + i * 86400000L,
                    BigDecimal.valueOf(40000 + i * 100),
                    BigDecimal.valueOf(40500 + i * 100),
                    BigDecimal.valueOf(39500 + i * 100),
                    BigDecimal.valueOf(40200 + i * 100),
                    BigDecimal.valueOf(1000000 + i * 10000)
            ));
        }
        return candles;
    }

    @Nested
    @DisplayName("calculateIndicators")
    class CalculateIndicators {

        @Test
        @DisplayName("모든 지표를 계산하여 반환한다")
        void calculatesAllIndicators() {
            // given
            String coinId = "bitcoin";
            int period = 30;
            List<OhlcvData> candles = createMockCandles(50);

            when(marketService.getOhlcv(coinId, "30"))
                    .thenReturn(candles);

            // RSI mock
            List<BigDecimal> rsiValues = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                rsiValues.add(i < 14 ? null : BigDecimal.valueOf(55));
            }
            when(indicatorCalculator.calculateRsi(eq(candles), eq(14)))
                    .thenReturn(rsiValues);

            // MACD mock
            List<BigDecimal> macdLine = new ArrayList<>();
            List<BigDecimal> signalLine = new ArrayList<>();
            List<BigDecimal> histogram = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                macdLine.add(BigDecimal.valueOf(100));
                signalLine.add(BigDecimal.valueOf(90));
                histogram.add(BigDecimal.valueOf(10));
            }
            when(indicatorCalculator.calculateMacd(eq(candles), eq(12), eq(26), eq(9)))
                    .thenReturn(new MacdResult(macdLine, signalLine, histogram));

            // SMA mock
            List<BigDecimal> ma20 = new ArrayList<>();
            List<BigDecimal> ma50 = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                ma20.add(BigDecimal.valueOf(40000));
                ma50.add(BigDecimal.valueOf(39000));
            }
            when(indicatorCalculator.calculateSma(eq(candles), eq(20)))
                    .thenReturn(ma20);
            when(indicatorCalculator.calculateSma(eq(candles), eq(50)))
                    .thenReturn(ma50);

            // Bollinger Bands mock
            List<BigDecimal> upper = new ArrayList<>();
            List<BigDecimal> middle = new ArrayList<>();
            List<BigDecimal> lower = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                upper.add(BigDecimal.valueOf(42000));
                middle.add(BigDecimal.valueOf(40000));
                lower.add(BigDecimal.valueOf(38000));
            }
            when(indicatorCalculator.calculateBollingerBands(eq(candles), eq(20), eq(2.0)))
                    .thenReturn(new BollingerBandsResult(upper, middle, lower));

            // when
            IndicatorResponse result = indicatorService.calculateIndicators(coinId, period);

            // then
            assertThat(result).isNotNull();
            assertThat(result.coinId()).isEqualTo("bitcoin");
            assertThat(result.rsi().value()).isEqualTo(BigDecimal.valueOf(55));
            assertThat(result.macd().macd()).isEqualTo(BigDecimal.valueOf(100));
            assertThat(result.macd().signal()).isEqualTo(BigDecimal.valueOf(90));
            assertThat(result.macd().histogram()).isEqualTo(BigDecimal.valueOf(10));
            assertThat(result.ma().ma20()).isEqualTo(BigDecimal.valueOf(40000));
            assertThat(result.ma().ma50()).isEqualTo(BigDecimal.valueOf(39000));
            assertThat(result.bollingerBands().upper()).isEqualTo(BigDecimal.valueOf(42000));
            assertThat(result.bollingerBands().middle()).isEqualTo(BigDecimal.valueOf(40000));
            assertThat(result.bollingerBands().lower()).isEqualTo(BigDecimal.valueOf(38000));
        }

        @Test
        @DisplayName("데이터가 부족하면 null 값을 반환한다")
        void returnsNullWhenInsufficientData() {
            // given
            String coinId = "bitcoin";
            int period = 30;
            List<OhlcvData> candles = createMockCandles(10);

            when(marketService.getOhlcv(coinId, "30"))
                    .thenReturn(candles);

            // All indicators return null values
            when(indicatorCalculator.calculateRsi(any(), anyInt()))
                    .thenReturn(List.of());
            when(indicatorCalculator.calculateMacd(any(), anyInt(), anyInt(), anyInt()))
                    .thenReturn(new MacdResult(List.of(), List.of(), List.of()));
            when(indicatorCalculator.calculateSma(any(), anyInt()))
                    .thenReturn(List.of());
            when(indicatorCalculator.calculateBollingerBands(any(), anyInt(), anyDouble()))
                    .thenReturn(new BollingerBandsResult(List.of(), List.of(), List.of()));

            // when
            IndicatorResponse result = indicatorService.calculateIndicators(coinId, period);

            // then
            assertThat(result).isNotNull();
            assertThat(result.rsi().value()).isNull();
            assertThat(result.macd().macd()).isNull();
            assertThat(result.ma().ma20()).isNull();
            assertThat(result.bollingerBands().upper()).isNull();
        }
    }
}
