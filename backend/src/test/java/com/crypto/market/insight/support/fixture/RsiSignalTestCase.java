package com.crypto.market.insight.support.fixture;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;

/**
 * RSI 시그널 테스트 케이스 VO
 */
public record RsiSignalTestCase(
        String name,
        BigDecimal rsiValue,
        Signal expectedSignal,
        String invariant
) {
    public static RsiSignalTestCase of(String name, Double rsi, Signal expected, String invariant) {
        return new RsiSignalTestCase(
                name,
                rsi != null ? BigDecimal.valueOf(rsi) : null,
                expected,
                invariant
        );
    }
}
