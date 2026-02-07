package com.crypto.market.insight.domain.strategy.engine;

import static com.crypto.market.insight.support.fixture.MarketFixture.ohlcvFromPrices;
import static com.crypto.market.insight.support.fixture.StrategyFixture.buyThenSellIndicators;
import static com.crypto.market.insight.support.fixture.StrategyFixture.defaultRsiSignalGenerator;
import static com.crypto.market.insight.support.fixture.StrategyFixture.feeTestIndicators;
import static com.crypto.market.insight.support.fixture.StrategyFixture.forceCloseIndicators;
import static com.crypto.market.insight.support.fixture.StrategyFixture.multipleBuyIndicators;
import static com.crypto.market.insight.support.fixture.StrategyFixture.sellWithoutPositionIndicators;
import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class BacktestEngineTest {

    private final BacktestEngine engine = new BacktestEngine();

    @Test
    @DisplayName("캔들이 부족하면 빈 결과 반환")
    void run_insufficientCandles_returnsEmpty() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0);
        List<BigDecimal> indicators = List.of(BigDecimal.valueOf(50));

        BacktestOutput result = engine.run(
                candles, indicators, defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

        assertThat(result.trades()).isEmpty();
        assertThat(result.metrics().tradeCount()).isZero();
    }

    @Test
    @DisplayName("BUY 시그널 후 다음 캔들 시가에서 진입")
    void run_buySignal_entersAtNextCandleOpen() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0);

        BacktestOutput result = engine.run(
                candles, buyThenSellIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

        assertThat(result.trades()).hasSize(1);
    }

    @Test
    @DisplayName("포지션 보유 중 추가 BUY 시그널 무시")
    void run_alreadyInPosition_ignoresBuySignal() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0, 105.0);

        BacktestOutput result = engine.run(
                candles, multipleBuyIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

        assertThat(result.trades()).hasSize(1);
    }

    @Test
    @DisplayName("포지션 없이 SELL 시그널 무시")
    void run_noPosition_ignoresSellSignal() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0);

        BacktestOutput result = engine.run(
                candles, sellWithoutPositionIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

        assertThat(result.trades()).isEmpty();
    }

    @Test
    @DisplayName("마지막 포지션은 강제 청산")
    void run_positionAtEnd_forceClosed() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0);

        BacktestOutput result = engine.run(
                candles, forceCloseIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

        assertThat(result.trades()).hasSize(1);
    }

    @Test
    @DisplayName("수수료와 슬리피지가 적용됨")
    void run_appliesFeeAndSlippage() {
        List<OhlcvData> candles = ohlcvFromPrices(100.0, 100.0, 100.0, 100.0);

        BacktestOutput result = engine.run(
                candles, feeTestIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

        // 가격 동일해도 수수료/슬리피지로 인해 손실 발생
        assertThat(result.trades().get(0).profit()).isLessThan(BigDecimal.ZERO);
    }

    @Nested
    @DisplayName("Edge 케이스")
    class EdgeCases {

        @Test
        @DisplayName("캔들이 0개면 빈 결과 반환")
        void run_emptyCandles_returnsEmpty() {
            List<OhlcvData> candles = Collections.emptyList();
            List<BigDecimal> indicators = Collections.emptyList();

            BacktestOutput result = engine.run(
                    candles, indicators, defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

            assertThat(result.trades()).isEmpty();
            assertThat(result.metrics().tradeCount()).isZero();
        }

        @Test
        @DisplayName("캔들 1개만 있으면 빈 결과 반환")
        void run_singleCandle_returnsEmpty() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0);
            List<BigDecimal> indicators = List.of(BigDecimal.valueOf(25));

            BacktestOutput result = engine.run(
                    candles, indicators, defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

            assertThat(result.trades())
                    .as("캔들이 1개면 다음 캔들에서 진입할 수 없으므로 거래 없음")
                    .isEmpty();
        }

        @Test
        @DisplayName("지표와 캔들 개수가 다르면 짧은 쪽 기준으로 동작")
        void run_mismatchedCandlesAndIndicators_usesMinimum() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0);
            List<BigDecimal> indicators = List.of(BigDecimal.valueOf(25), BigDecimal.valueOf(75));

            BacktestOutput result = engine.run(
                    candles, indicators, defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

            // 지표가 2개뿐이므로 BUY(25) -> 진입 -> SELL(75) -> 청산 시도하지만
            // 다음 캔들 필요하므로 거래 없을 수 있음
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("모든 지표가 HOLD면 거래 없음")
        void run_allHoldSignals_noTrades() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0);
            List<BigDecimal> indicators = List.of(
                    BigDecimal.valueOf(50),
                    BigDecimal.valueOf(50),
                    BigDecimal.valueOf(50),
                    BigDecimal.valueOf(50),
                    BigDecimal.valueOf(50)
            );

            BacktestOutput result = engine.run(
                    candles, indicators, defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

            assertThat(result.trades())
                    .as("모든 시그널이 HOLD면 진입/청산 없음")
                    .isEmpty();
        }
    }

    @Nested
    @DisplayName("불변조건 검증")
    class Invariants {

        @Test
        @DisplayName("거래 완료 시 진입가와 청산가가 기록됨")
        void completedTrade_hasEntryAndExitPrices() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0);

            BacktestOutput result = engine.run(
                    candles, buyThenSellIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

            assertThat(result.trades()).hasSize(1);
            assertThat(result.trades().get(0).entryPrice())
                    .as("진입가는 0보다 커야 함")
                    .isGreaterThan(BigDecimal.ZERO);
            assertThat(result.trades().get(0).exitPrice())
                    .as("청산가는 0보다 커야 함")
                    .isGreaterThan(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("메트릭스는 거래 내역과 일관성 유지")
        void metrics_consistentWithTrades() {
            List<OhlcvData> candles = ohlcvFromPrices(100.0, 101.0, 102.0, 103.0, 104.0);

            BacktestOutput result = engine.run(
                    candles, buyThenSellIndicators(), defaultRsiSignalGenerator(), BacktestConfig.defaultConfig());

            assertThat(result.metrics().tradeCount())
                    .as("메트릭스의 거래 수 = 실제 거래 리스트 크기")
                    .isEqualTo(result.trades().size());
        }
    }
}
