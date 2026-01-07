package com.crypto.market.insight.common.ratelimit;

import com.crypto.market.insight.common.exception.RateLimitException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

/**
 * Caffeine 기반 Rate Limiter
 * - IP당 Rate Limit
 * - 인증 사용자 Rate Limit
 * - 전체 시스템 Rate Limit
 */
@Component
public class RateLimiter {

    private static final int ANONYMOUS_LIMIT = 5;       // IP당 분당 5회
    private static final int AUTHENTICATED_LIMIT = 10; // 인증 사용자 분당 10회
    private static final int GLOBAL_LIMIT = 100;       // 전체 시스템 분당 100회
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final Cache<String, RateLimitBucket> buckets;
    private final RateLimitBucket globalBucket;

    public RateLimiter() {
        this.buckets = Caffeine.newBuilder()
                .expireAfterWrite(WINDOW)
                .maximumSize(10000)
                .build();
        this.globalBucket = new RateLimitBucket(GLOBAL_LIMIT);
    }

    /**
     * Rate Limit 체크
     *
     * @param key           식별자 (IP 또는 userId)
     * @param authenticated 인증 여부
     * @throws RateLimitException 한도 초과 시
     */
    public void checkLimit(String key, boolean authenticated) {
        // 전역 Rate Limit 체크
        if (!globalBucket.tryConsume()) {
            throw new RateLimitException(globalBucket.getRetryAfterSeconds());
        }

        // 개별 Rate Limit 체크
        int limit = authenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;
        RateLimitBucket bucket = buckets.get(key, k -> new RateLimitBucket(limit));

        if (!bucket.tryConsume()) {
            throw new RateLimitException(bucket.getRetryAfterSeconds());
        }
    }

    /**
     * Rate Limit 버킷
     */
    private static class RateLimitBucket {
        private final int limit;
        private final AtomicInteger count;
        private final AtomicLong windowStart;

        RateLimitBucket(int limit) {
            this.limit = limit;
            this.count = new AtomicInteger(0);
            this.windowStart = new AtomicLong(System.currentTimeMillis());
        }

        boolean tryConsume() {
            long now = System.currentTimeMillis();
            long windowStartTime = windowStart.get();

            // 윈도우가 만료되었으면 리셋
            if (now - windowStartTime >= WINDOW.toMillis()) {
                if (windowStart.compareAndSet(windowStartTime, now)) {
                    count.set(0);
                }
            }

            // 카운트 증가
            return count.incrementAndGet() <= limit;
        }

        long getRetryAfterSeconds() {
            long elapsed = System.currentTimeMillis() - windowStart.get();
            long remaining = WINDOW.toMillis() - elapsed;
            return Math.max(1, (remaining / 1000) + 1);
        }
    }
}
