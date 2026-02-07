package com.crypto.market.insight.domain.strategy.signal;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import com.crypto.market.insight.support.fixture.RsiSignalTestCase;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

class RsiSignalGeneratorTest {

    private final RsiSignalGenerator generator = new RsiSignalGenerator(
            new RsiParameters(14, 30, 70)
    );

    @Nested
    @DisplayName("불변조건 기반 시그널 생성")
    class SignalInvariants {

        static Stream<RsiSignalTestCase> signalTestCases() {
            return Stream.of(
                    // Happy: BUY 시그널
                    RsiSignalTestCase.of("RSI 25 (과매도)", 25.0, Signal.BUY,
                            "RSI < oversold(30)이면 BUY"),
                    RsiSignalTestCase.of("RSI 29.99 (과매도 근접)", 29.99, Signal.BUY,
                            "RSI < oversold(30)이면 BUY"),

                    // Edge: 경계값 30 (BUY)
                    RsiSignalTestCase.of("RSI 30 (oversold 경계)", 30.0, Signal.BUY,
                            "RSI <= oversold(30)이면 BUY"),

                    // Happy: SELL 시그널
                    RsiSignalTestCase.of("RSI 75 (과매수)", 75.0, Signal.SELL,
                            "RSI > overbought(70)이면 SELL"),
                    RsiSignalTestCase.of("RSI 70.01 (과매수 근접)", 70.01, Signal.SELL,
                            "RSI > overbought(70)이면 SELL"),

                    // Edge: 경계값 70 (SELL)
                    RsiSignalTestCase.of("RSI 70 (overbought 경계)", 70.0, Signal.SELL,
                            "RSI >= overbought(70)이면 SELL"),

                    // Happy: HOLD 시그널
                    RsiSignalTestCase.of("RSI 50 (중립)", 50.0, Signal.HOLD,
                            "RSI가 범위 내이면 HOLD"),
                    RsiSignalTestCase.of("RSI 30.01 (oversold 직후)", 30.01, Signal.HOLD,
                            "RSI > oversold(30) && RSI < overbought(70)이면 HOLD"),
                    RsiSignalTestCase.of("RSI 69.99 (overbought 직전)", 69.99, Signal.HOLD,
                            "RSI > oversold(30) && RSI < overbought(70)이면 HOLD"),

                    // Edge: null 입력
                    RsiSignalTestCase.of("RSI null", null, Signal.HOLD,
                            "RSI가 null이면 HOLD")
            );
        }

        @ParameterizedTest(name = "{0}")
        @MethodSource("signalTestCases")
        @DisplayName("RSI 값에 따른 시그널 생성")
        void generate_invariants(RsiSignalTestCase testCase) {
            Signal result = generator.generate(testCase.rsiValue());

            assertThat(result)
                    .as(testCase.invariant())
                    .isEqualTo(testCase.expectedSignal());
        }
    }

    @Nested
    @DisplayName("구현 검증 (단위 테스트)")
    class UnitTests {

        @Test
        @DisplayName("RSI가 oversold 이하면 BUY 시그널")
        void generate_belowOrEqualOversold_returnsBuy() {
            assertThat(generator.generate(java.math.BigDecimal.valueOf(25))).isEqualTo(Signal.BUY);
            assertThat(generator.generate(java.math.BigDecimal.valueOf(29.99))).isEqualTo(Signal.BUY);
            assertThat(generator.generate(java.math.BigDecimal.valueOf(30))).isEqualTo(Signal.BUY);
        }

        @Test
        @DisplayName("RSI가 overbought 이상이면 SELL 시그널")
        void generate_aboveOrEqualOverbought_returnsSell() {
            assertThat(generator.generate(java.math.BigDecimal.valueOf(75))).isEqualTo(Signal.SELL);
            assertThat(generator.generate(java.math.BigDecimal.valueOf(70.01))).isEqualTo(Signal.SELL);
            assertThat(generator.generate(java.math.BigDecimal.valueOf(70))).isEqualTo(Signal.SELL);
        }

        @Test
        @DisplayName("RSI가 범위 내면 HOLD 시그널")
        void generate_withinRange_returnsHold() {
            assertThat(generator.generate(java.math.BigDecimal.valueOf(30.01))).isEqualTo(Signal.HOLD);
            assertThat(generator.generate(java.math.BigDecimal.valueOf(50))).isEqualTo(Signal.HOLD);
            assertThat(generator.generate(java.math.BigDecimal.valueOf(69.99))).isEqualTo(Signal.HOLD);
        }

        @Test
        @DisplayName("RSI가 null이면 HOLD 시그널")
        void generate_null_returnsHold() {
            assertThat(generator.generate(null)).isEqualTo(Signal.HOLD);
        }
    }
}
