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
import java.util.List;
import org.junit.jupiter.api.DisplayName;
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
}
