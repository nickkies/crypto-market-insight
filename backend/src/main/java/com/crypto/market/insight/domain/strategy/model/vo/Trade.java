package com.crypto.market.insight.domain.strategy.model.vo;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 거래 기록 VO
 */
public record Trade(
        Instant entryTime,
        Instant exitTime,
        BigDecimal entryPrice,
        BigDecimal exitPrice,
        BigDecimal quantity,
        BigDecimal profit,
        BigDecimal profitPercent
) {
    public boolean isWin() {
        return profit.compareTo(BigDecimal.ZERO) > 0;
    }
}
