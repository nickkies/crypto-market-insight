package com.crypto.market.insight.domain.strategy.signal;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;

/**
 * 시그널 생성기 인터페이스
 */
public interface SignalGenerator {

    /**
     * 지표 값을 기반으로 시그널 생성
     *
     * @param indicatorValue 지표 값 (예: RSI)
     * @return 시그널 (BUY, SELL, HOLD)
     */
    Signal generate(BigDecimal indicatorValue);
}
