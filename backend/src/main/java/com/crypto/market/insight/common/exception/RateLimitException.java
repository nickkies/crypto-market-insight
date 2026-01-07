package com.crypto.market.insight.common.exception;

import lombok.Getter;

/**
 * Rate Limit 초과 예외
 */
@Getter
public class RateLimitException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitException(long retryAfterSeconds) {
        super(ErrorCode.RATE_LIMIT_EXCEEDED.getMessage());
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
