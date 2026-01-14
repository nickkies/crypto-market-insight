package com.crypto.market.insight.domain.strategy.signal;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MacdSignalGeneratorTest {

    private MacdSignalGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new MacdSignalGenerator();
    }

    @Test
    @DisplayName("히스토그램이 음수에서 양수로 전환되면 BUY 시그널 (골든 크로스)")
    void generate_crossFromNegativeToPositive_returnsBuy() {
        // 첫 번째 값: 음수 히스토그램
        generator.generate(BigDecimal.valueOf(-5));

        // 두 번째 값: 양수 히스토그램 → 골든 크로스
        Signal signal = generator.generate(BigDecimal.valueOf(3));

        assertThat(signal).isEqualTo(Signal.BUY);
    }

    @Test
    @DisplayName("히스토그램이 양수에서 음수로 전환되면 SELL 시그널 (데드 크로스)")
    void generate_crossFromPositiveToNegative_returnsSell() {
        // 첫 번째 값: 양수 히스토그램
        generator.generate(BigDecimal.valueOf(5));

        // 두 번째 값: 음수 히스토그램 → 데드 크로스
        Signal signal = generator.generate(BigDecimal.valueOf(-3));

        assertThat(signal).isEqualTo(Signal.SELL);
    }

    @Test
    @DisplayName("히스토그램이 계속 양수면 HOLD 시그널")
    void generate_stayPositive_returnsHold() {
        generator.generate(BigDecimal.valueOf(5));
        Signal signal = generator.generate(BigDecimal.valueOf(8));

        assertThat(signal).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("히스토그램이 계속 음수면 HOLD 시그널")
    void generate_stayNegative_returnsHold() {
        generator.generate(BigDecimal.valueOf(-5));
        Signal signal = generator.generate(BigDecimal.valueOf(-3));

        assertThat(signal).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("첫 번째 값에서는 이전 값이 없으므로 HOLD 시그널")
    void generate_firstValue_returnsHold() {
        Signal signal = generator.generate(BigDecimal.valueOf(5));
        assertThat(signal).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("null 값은 HOLD 시그널")
    void generate_null_returnsHold() {
        assertThat(generator.generate(null)).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("음수 → 0 → 양수로 전환되면 BUY 시그널")
    void generate_crossFromNegativeToZeroToPositive_returnsBuy() {
        generator.generate(BigDecimal.valueOf(-5)); // 음수
        generator.generate(BigDecimal.ZERO);        // 0 (부호 유지)
        Signal signal = generator.generate(BigDecimal.valueOf(1)); // 양수

        // 음수에서 0을 거쳐 양수로 전환 = 골든 크로스
        assertThat(signal).isEqualTo(Signal.BUY);
    }

    @Test
    @DisplayName("0만 있으면 시그널 없음")
    void generate_onlyZeros_returnsHold() {
        generator.generate(BigDecimal.ZERO);
        Signal signal = generator.generate(BigDecimal.ZERO);

        assertThat(signal).isEqualTo(Signal.HOLD);
    }
}
