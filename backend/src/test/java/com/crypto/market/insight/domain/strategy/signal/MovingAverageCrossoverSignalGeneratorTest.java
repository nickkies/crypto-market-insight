package com.crypto.market.insight.domain.strategy.signal;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MovingAverageCrossoverSignalGeneratorTest {

    private MovingAverageCrossoverSignalGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new MovingAverageCrossoverSignalGenerator();
    }

    @Test
    @DisplayName("MA diff가 음수에서 양수로 전환되면 BUY 시그널 (골든 크로스)")
    void generate_goldenCross_returnsBuy() {
        // 첫 번째 값: 단기 MA < 장기 MA (음수)
        generator.generate(BigDecimal.valueOf(-100));

        // 두 번째 값: 단기 MA > 장기 MA (양수) → 골든 크로스
        Signal signal = generator.generate(BigDecimal.valueOf(50));

        assertThat(signal).isEqualTo(Signal.BUY);
    }

    @Test
    @DisplayName("MA diff가 양수에서 음수로 전환되면 SELL 시그널 (데드 크로스)")
    void generate_deadCross_returnsSell() {
        // 첫 번째 값: 단기 MA > 장기 MA (양수)
        generator.generate(BigDecimal.valueOf(100));

        // 두 번째 값: 단기 MA < 장기 MA (음수) → 데드 크로스
        Signal signal = generator.generate(BigDecimal.valueOf(-50));

        assertThat(signal).isEqualTo(Signal.SELL);
    }

    @Test
    @DisplayName("MA diff가 계속 양수면 HOLD 시그널")
    void generate_stayAbove_returnsHold() {
        generator.generate(BigDecimal.valueOf(100));
        Signal signal = generator.generate(BigDecimal.valueOf(150));

        assertThat(signal).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("MA diff가 계속 음수면 HOLD 시그널")
    void generate_stayBelow_returnsHold() {
        generator.generate(BigDecimal.valueOf(-100));
        Signal signal = generator.generate(BigDecimal.valueOf(-50));

        assertThat(signal).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("첫 번째 값에서는 이전 값이 없으므로 HOLD 시그널")
    void generate_firstValue_returnsHold() {
        Signal signal = generator.generate(BigDecimal.valueOf(100));
        assertThat(signal).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("null 값은 HOLD 시그널")
    void generate_null_returnsHold() {
        assertThat(generator.generate(null)).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("연속적인 크로스오버 시그널")
    void generate_multipleCrossovers() {
        // 음수 시작
        generator.generate(BigDecimal.valueOf(-50));

        // 골든 크로스
        assertThat(generator.generate(BigDecimal.valueOf(30))).isEqualTo(Signal.BUY);

        // 계속 상승 - HOLD
        assertThat(generator.generate(BigDecimal.valueOf(100))).isEqualTo(Signal.HOLD);

        // 데드 크로스
        assertThat(generator.generate(BigDecimal.valueOf(-20))).isEqualTo(Signal.SELL);

        // 계속 하락 - HOLD
        assertThat(generator.generate(BigDecimal.valueOf(-80))).isEqualTo(Signal.HOLD);
    }

    @Test
    @DisplayName("음수 → 0 → 양수로 전환되면 BUY 시그널")
    void generate_crossThroughZero_returnsBuy() {
        generator.generate(BigDecimal.valueOf(-50)); // 음수
        generator.generate(BigDecimal.ZERO);         // 0 (부호 유지)
        Signal signal = generator.generate(BigDecimal.valueOf(30)); // 양수

        assertThat(signal).isEqualTo(Signal.BUY);
    }
}
