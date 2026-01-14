package com.crypto.market.insight.domain.strategy.signal;

import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;

/**
 * RSI 기반 시그널 생성기
 * - RSI <= oversold → BUY (과매도)
 * - RSI >= overbought → SELL (과매수)
 * - 그 외 → HOLD
 */
public class RsiSignalGenerator implements SignalGenerator {

    private final BigDecimal oversold;
    private final BigDecimal overbought;

    public RsiSignalGenerator(RsiParameters parameters) {
        this.oversold = BigDecimal.valueOf(parameters.oversold());
        this.overbought = BigDecimal.valueOf(parameters.overbought());
    }

    @Override
    public Signal generate(BigDecimal rsiValue) {
        if (rsiValue == null) {
            return Signal.HOLD;
        }
        // <= 로 경계값 포함
        if (rsiValue.compareTo(oversold) <= 0) {
            return Signal.BUY;
        }
        // >= 로 경계값 포함
        if (rsiValue.compareTo(overbought) >= 0) {
            return Signal.SELL;
        }
        return Signal.HOLD;
    }
}
