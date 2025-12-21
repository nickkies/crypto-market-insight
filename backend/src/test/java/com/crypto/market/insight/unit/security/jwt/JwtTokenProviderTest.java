package com.crypto.market.insight.unit.security.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private static final String SECRET = "test-secret-key-for-jwt-token-must-be-at-least-256-bits";
    private static final long EXPIRATION = 86400000L; // 24시간

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRATION);
    }

    @Test
    @DisplayName("토큰 생성 성공")
    void createToken_ShouldReturnValidToken() {
        Long userId = 1L;
        String email = "test@github.com";

        String token = jwtTokenProvider.createToken(userId, email);

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("토큰에서 userId 추출")
    void getUserId_ShouldReturnUserId() {
        Long userId = 1L;
        String email = "test@github.com";
        String token = jwtTokenProvider.createToken(userId, email);

        Long extractedUserId = jwtTokenProvider.getUserId(token);

        assertThat(extractedUserId).isEqualTo(userId);
    }

    @Test
    @DisplayName("토큰에서 email 추출")
    void getEmail_ShouldReturnEmail() {
        Long userId = 1L;
        String email = "test@github.com";
        String token = jwtTokenProvider.createToken(userId, email);

        String extractedEmail = jwtTokenProvider.getEmail(token);

        assertThat(extractedEmail).isEqualTo(email);
    }

    @Test
    @DisplayName("유효한 토큰 검증 성공")
    void validateToken_ShouldReturnTrue_WhenTokenIsValid() {
        String token = jwtTokenProvider.createToken(1L, "test@github.com");

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("잘못된 토큰 검증 실패")
    void validateToken_ShouldReturnFalse_WhenTokenIsInvalid() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("만료된 토큰 검증 실패")
    void validateToken_ShouldReturnFalse_WhenTokenIsExpired() {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(SECRET, 1L); // 1ms
        String token = shortLivedProvider.createToken(1L, "test@github.com");

        try {
            Thread.sleep(10); // 토큰 만료 대기
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        boolean isValid = shortLivedProvider.validateToken(token);

        assertThat(isValid).isFalse();
    }
}
