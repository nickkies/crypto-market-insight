package com.crypto.market.insight.domain.strategy.signal;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BollingerBandsSignalGeneratorTest {

    private final BollingerBandsSignalGenerator generator = new BollingerBandsSignalGenerator();

    @Test
    @DisplayName("%B가 0 이하면 BUY 시그널 (가격이 하단 밴드 이하)")
    void generate_belowOrEqualLowerBand_returnsBuy() {
        assertThat(generator.generate(BigDecimal.valueOf(-0.1))).isEqualTo(Signal.BUY);
        assertThat(generator.generate(BigDecimal.valueOf(-0.5))).isEqualTo(Signal.BUY);
        assertThat(generator.generate(BigDecimal.valueOf(0))).isEqualTo(Signal.BUY); // 경계값 포함
    }

    @Test
    @DisplayName("%B가 1 이상이면 SELL 시그널 (가격이 상단 밴드 이상)")
    void generate_aboveOrEqualUpperBand_returnsSell() {
        assertThat(generator.generate(BigDecimal.valueOf(1.1))).isEqualTo(Signal.SELL);
        assertThat(generator.generate(BigDecimal.valueOf(1.5))).isEqualTo(Signal.SELL);
        assertThat(generator.generate(BigDecimal.valueOf(1))).isEqualTo(Signal.SELL); // 경계값 포함
    }

    @Test
    @DisplayName("%B가 0-1 사이면 HOLD 시그널 (밴드 내부)")
    void generate_withinBands_returnsHold() {
        assertThat(generator.generate(BigDecimal.valueOf(0.01))).isEqualTo(Signal.HOLD);
        assertThat(generator.generate(BigDecimal.valueOf(0.5))).isEqualTo(Signal.HOLD);
        assertThat(generator.generate(BigDecimal.valueOf(0.99))).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("null 값은 HOLD 시그널")
    void generate_null_returnsHold() {
        assertThat(generator.generate(null)).isEqualTo(Signal.HOLD);
    }
}
