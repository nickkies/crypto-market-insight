package com.crypto.market.insight.domain.strategy.engine;

import static com.crypto.market.insight.support.fixture.StrategyFixture.createTrade;
import static com.crypto.market.insight.support.fixture.StrategyFixture.mddTestTrades;
import static com.crypto.market.insight.support.fixture.StrategyFixture.winLossTrades;
import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MetricsCalculatorTest {

    @Test
    @DisplayName("거래가 없으면 빈 지표 반환")
    void calculate_noTrades_returnsEmpty() {
        PerformanceMetrics metrics = MetricsCalculator.calculate(
                List.of(),
                BigDecimal.valueOf(10_000_000),
                BigDecimal.valueOf(10_000_000)
        );

        assertThat(metrics.tradeCount()).isZero();
        assertThat(metrics.cumulativeReturn()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("누적 수익률 계산")
    void calculate_cumulativeReturn() {
        List<Trade> trades = List.of(createTrade(BigDecimal.valueOf(100_000)));

        PerformanceMetrics metrics = MetricsCalculator.calculate(
                trades,
                BigDecimal.valueOf(10_000_000),
                BigDecimal.valueOf(10_100_000)
        );

        assertThat(metrics.cumulativeReturn()).isEqualByComparingTo(BigDecimal.valueOf(1.00));
    }

    @Test
    @DisplayName("승률 계산")
    void calculate_winRate() {
        PerformanceMetrics metrics = MetricsCalculator.calculate(
                winLossTrades(),
                BigDecimal.valueOf(10_000_000),
                BigDecimal.valueOf(10_000_150)
        );

        assertThat(metrics.winRate()).isEqualByComparingTo(BigDecimal.valueOf(50.00));
        assertThat(metrics.tradeCount()).isEqualTo(4);
    }

    @Test
    @DisplayName("MDD 계산")
    void calculate_mdd() {
        // 초기 100 → +20 (120) → -40 (80) → +30 (110)
        // Peak: 120, Drawdown: (120-80)/120 = 33.33%
        PerformanceMetrics metrics = MetricsCalculator.calculate(
                mddTestTrades(),
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(110)
        );

        assertThat(metrics.mdd().doubleValue()).isBetween(33.0, 34.0);
    }
}
