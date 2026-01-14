package com.crypto.market.insight.domain.strategy;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import com.crypto.market.insight.domain.strategy.engine.BacktestConfig;
import com.crypto.market.insight.domain.strategy.engine.BacktestEngine;
import com.crypto.market.insight.domain.strategy.engine.BacktestOutput;
import com.crypto.market.insight.domain.strategy.indicator.IndicatorCalculator;
import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.signal.BollingerBandsSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.MacdSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.MovingAverageCrossoverSignalGenerator;
import com.crypto.market.insight.domain.strategy.signal.RsiSignalGenerator;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * 백테스트 통합 테스트 - 다양한 시장 조건에서 전략별 거래 발생 확인
 */
class BacktestIntegrationTest {

    private final BacktestEngine engine = new BacktestEngine();
    private final IndicatorCalculator calculator = new IndicatorCalculator();

    @Test
    @DisplayName("RSI 전략: 변동성 시장에서 여러 거래 발생")
    void rsi_volatileMarket_multipleTradesGenerated() {
        // 변동성 있는 가격 데이터 생성 (위아래로 크게 움직임)
        List<OhlcvData> candles = generateVolatileCandles(90);

        var rsiValues = calculator.calculateRsi(candles, 7);
        var generator = new RsiSignalGenerator(new RsiParameters(7, 45, 55));

        BacktestOutput result = engine.run(candles, rsiValues, generator, BacktestConfig.defaultConfig());

        System.out.println("RSI trades: " + result.trades().size());
        System.out.println("RSI min: " + rsiValues.stream().filter(v -> v != null).min(BigDecimal::compareTo));
        System.out.println("RSI max: " + rsiValues.stream().filter(v -> v != null).max(BigDecimal::compareTo));

        assertThat(result.trades().size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("MACD 전략: 변동성 시장에서 여러 거래 발생")
    void macd_volatileMarket_multipleTradesGenerated() {
        List<OhlcvData> candles = generateVolatileCandles(90);

        var macdResult = calculator.calculateMacd(candles, 5, 13, 6);
        var histogram = macdResult.histogram();
        var generator = new MacdSignalGenerator();

        // 히스토그램 분석
        var nonNullHist = histogram.stream().filter(h -> h != null).toList();
        long positive = nonNullHist.stream().filter(h -> h.signum() > 0).count();
        long negative = nonNullHist.stream().filter(h -> h.signum() < 0).count();
        System.out.println("MACD histogram: positive=" + positive + ", negative=" + negative);

        BacktestOutput result = engine.run(candles, histogram, generator, BacktestConfig.defaultConfig());

        System.out.println("MACD trades: " + result.trades().size());

        assertThat(result.trades().size()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("Bollinger Bands 전략: 변동성 시장에서 거래 발생")
    void bollingerBands_volatileMarket_tradesGenerated() {
        List<OhlcvData> candles = generateVolatileCandles(90);

        var percentB = calculator.calculatePercentB(candles, 10, 1.5);
        var generator = new BollingerBandsSignalGenerator();

        // %B 분석
        var nonNull = percentB.stream().filter(p -> p != null).toList();
        long belowZero = nonNull.stream().filter(p -> p.compareTo(BigDecimal.ZERO) <= 0).count();
        long aboveOne = nonNull.stream().filter(p -> p.compareTo(BigDecimal.ONE) >= 0).count();
        System.out.println("BB %B: belowZero=" + belowZero + ", aboveOne=" + aboveOne);

        BacktestOutput result = engine.run(candles, percentB, generator, BacktestConfig.defaultConfig());

        System.out.println("BB trades: " + result.trades().size());

        assertThat(result.trades().size()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("Moving Average 전략: 변동성 시장에서 거래 발생")
    void movingAverage_volatileMarket_tradesGenerated() {
        List<OhlcvData> candles = generateVolatileCandles(90);

        var maDiff = calculator.calculateMaDiff(candles, 3, 10);
        var generator = new MovingAverageCrossoverSignalGenerator();

        // MA diff 분석
        var nonNull = maDiff.stream().filter(d -> d != null).toList();
        long positive = nonNull.stream().filter(d -> d.signum() > 0).count();
        long negative = nonNull.stream().filter(d -> d.signum() < 0).count();
        System.out.println("MA diff: positive=" + positive + ", negative=" + negative);

        BacktestOutput result = engine.run(candles, maDiff, generator, BacktestConfig.defaultConfig());

        System.out.println("MA trades: " + result.trades().size());

        assertThat(result.trades().size()).isGreaterThanOrEqualTo(1);
    }

    /**
     * 변동성 있는 캔들 생성 - 주기적으로 상승/하락 반복
     */
    private List<OhlcvData> generateVolatileCandles(int count) {
        List<OhlcvData> candles = new ArrayList<>();
        long baseTimestamp = System.currentTimeMillis() - (count * 86400000L);
        double basePrice = 90000;

        for (int i = 0; i < count; i++) {
            long timestamp = baseTimestamp + (i * 86400000L);

            // 10일 주기로 가격 변동 (±10%)
            double cycle = Math.sin(2 * Math.PI * i / 10);
            double price = basePrice * (1 + 0.1 * cycle);

            // 일간 변동성 추가
            double dailyVariation = Math.sin(i * 0.7) * 0.02 * basePrice;
            price += dailyVariation;

            candles.add(new OhlcvData(
                    timestamp,
                    BigDecimal.valueOf(price - 500),
                    BigDecimal.valueOf(price + 1000),
                    BigDecimal.valueOf(price - 1000),
                    BigDecimal.valueOf(price),
                    BigDecimal.valueOf(1000000)
            ));
        }
        return candles;
    }
}
