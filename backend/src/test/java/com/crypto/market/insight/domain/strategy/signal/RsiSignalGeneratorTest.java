package com.crypto.market.insight.domain.strategy.signal;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RsiSignalGeneratorTest {

    private final RsiSignalGenerator generator = new RsiSignalGenerator(
            new RsiParameters(14, 30, 70)
    );

    @Test
    @DisplayName("RSI가 oversold 미만이면 BUY 시그널")
    void generate_belowOversold_returnsBuy() {
        assertThat(generator.generate(BigDecimal.valueOf(25))).isEqualTo(Signal.BUY);
        assertThat(generator.generate(BigDecimal.valueOf(29.99))).isEqualTo(Signal.BUY);
    }

    @Test
    @DisplayName("RSI가 overbought 초과이면 SELL 시그널")
    void generate_aboveOverbought_returnsSell() {
        assertThat(generator.generate(BigDecimal.valueOf(75))).isEqualTo(Signal.SELL);
        assertThat(generator.generate(BigDecimal.valueOf(70.01))).isEqualTo(Signal.SELL);
    }

    @Test
    @DisplayName("RSI가 범위 내면 HOLD 시그널")
    void generate_withinRange_returnsHold() {
        assertThat(generator.generate(BigDecimal.valueOf(30))).isEqualTo(Signal.HOLD);
        assertThat(generator.generate(BigDecimal.valueOf(50))).isEqualTo(Signal.HOLD);
        assertThat(generator.generate(BigDecimal.valueOf(70))).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("RSI가 null이면 HOLD 시그널")
    void generate_null_returnsHold() {
        assertThat(generator.generate(null)).isEqualTo(Signal.HOLD);
    }
}
