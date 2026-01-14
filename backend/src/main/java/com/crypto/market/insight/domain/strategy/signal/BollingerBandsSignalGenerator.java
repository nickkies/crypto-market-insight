package com.crypto.market.insight.domain.strategy.signal;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;

/**
 * Bollinger Bands 기반 시그널 생성기
 * - %B <= 0 (가격이 하단 밴드 또는 아래) → BUY (과매도)
 * - %B >= 1 (가격이 상단 밴드 또는 위) → SELL (과매수)
 * - 그 외 → HOLD
 *
 * %B = (Price - Lower Band) / (Upper Band - Lower Band)
 * %B <= 0: 가격이 하단 밴드 이하
 * %B >= 1: 가격이 상단 밴드 이상
 */
public class BollingerBandsSignalGenerator implements SignalGenerator {

    @Override
    public Signal generate(BigDecimal percentB) {
        if (percentB == null) {
            return Signal.HOLD;
        }

        // %B <= 0: 가격이 하단 밴드 이하 → 매수 신호
        if (percentB.compareTo(BigDecimal.ZERO) <= 0) {
            return Signal.BUY;
        }

        // %B >= 1: 가격이 상단 밴드 이상 → 매도 신호
        if (percentB.compareTo(BigDecimal.ONE) >= 0) {
            return Signal.SELL;
        }

        return Signal.HOLD;
    }
}
