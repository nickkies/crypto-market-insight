package com.crypto.market.insight.common.ratelimit;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.crypto.market.insight.common.exception.RateLimitException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RateLimiterTest {

    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new RateLimiter();
    }

    @Test
    @DisplayName("익명 사용자 - 5회까지 허용")
    void anonymous_allows5Requests() {
        String ip = "192.168.1.1";

        for (int i = 0; i < 5; i++) {
            assertThatNoException()
                    .isThrownBy(() -> rateLimiter.checkLimit("ip:" + ip, false));
        }
    }

    @Test
    @DisplayName("익명 사용자 - 6회째 요청시 RateLimitException")
    void anonymous_throwsOnSixthRequest() {
        String ip = "192.168.1.2";

        for (int i = 0; i < 5; i++) {
            rateLimiter.checkLimit("ip:" + ip, false);
        }

        assertThatThrownBy(() -> rateLimiter.checkLimit("ip:" + ip, false))
                .isInstanceOf(RateLimitException.class);
    }

    @Test
    @DisplayName("인증 사용자 - 10회까지 허용")
    void authenticated_allows10Requests() {
        String userId = "user:123";

        for (int i = 0; i < 10; i++) {
            assertThatNoException()
                    .isThrownBy(() -> rateLimiter.checkLimit(userId, true));
        }
    }

    @Test
    @DisplayName("인증 사용자 - 11회째 요청시 RateLimitException")
    void authenticated_throwsOnEleventhRequest() {
        String userId = "user:456";

        for (int i = 0; i < 10; i++) {
            rateLimiter.checkLimit(userId, true);
        }

        assertThatThrownBy(() -> rateLimiter.checkLimit(userId, true))
                .isInstanceOf(RateLimitException.class);
    }

    @Test
    @DisplayName("서로 다른 IP는 별도로 카운트")
    void differentIps_countedSeparately() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.checkLimit("ip:192.168.1.10", false);
            rateLimiter.checkLimit("ip:192.168.1.11", false);
        }

        // 각각 5회씩 사용했으므로 6회째에 실패
        assertThatThrownBy(() -> rateLimiter.checkLimit("ip:192.168.1.10", false))
                .isInstanceOf(RateLimitException.class);
        assertThatThrownBy(() -> rateLimiter.checkLimit("ip:192.168.1.11", false))
                .isInstanceOf(RateLimitException.class);
    }

    @Test
    @DisplayName("RateLimitException에 retryAfterSeconds 포함")
    void exception_containsRetryAfter() {
        String ip = "192.168.1.100";

        for (int i = 0; i < 5; i++) {
            rateLimiter.checkLimit("ip:" + ip, false);
        }

        assertThatThrownBy(() -> rateLimiter.checkLimit("ip:" + ip, false))
                .isInstanceOf(RateLimitException.class)
                .satisfies(e -> {
                    RateLimitException ex = (RateLimitException) e;
                    org.assertj.core.api.Assertions.assertThat(ex.getRetryAfterSeconds())
                            .isGreaterThan(0);
                });
    }
}
