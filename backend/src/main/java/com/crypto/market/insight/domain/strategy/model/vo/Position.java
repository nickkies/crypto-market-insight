package com.crypto.market.insight.domain.strategy.model.vo;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 포지션 정보 VO
 */
public record Position(
        BigDecimal entryPrice,
        BigDecimal quantity,
        Instant entryTime
) {
}
