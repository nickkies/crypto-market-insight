package com.crypto.market.insight.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.crypto.market.insight.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Nested
    @DisplayName("GET /api/auth/me")
    class GetCurrentUser {

        @Test
        @DisplayName("인증된 사용자 정보 조회 성공")
        void success() throws Exception {
            // given
            Long userId = 1L;
            String email = "test@github.com";
            String token = jwtTokenProvider.createToken(userId, email);

            // when & then
            mockMvc.perform(get("/api/auth/me")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.userId").value(userId));
        }

        @Test
        @DisplayName("인증 토큰 없이 요청하면 401 에러")
        void noToken_returns401() throws Exception {
            mockMvc.perform(get("/api/auth/me"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("잘못된 토큰으로 요청하면 401 에러")
        void invalidToken_returns401() throws Exception {
            mockMvc.perform(get("/api/auth/me")
                            .header("Authorization", "Bearer invalid.token.here"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("만료된 토큰으로 요청하면 401 에러")
        void expiredToken_returns401() throws Exception {
            // given - 만료 시간이 1ms인 토큰 생성
            JwtTokenProvider shortLivedProvider = new JwtTokenProvider(
                    "test-secret-key-for-jwt-token-must-be-at-least-256-bits-long-enough",
                    1L
            );
            String expiredToken = shortLivedProvider.createToken(1L, "test@github.com");

            // 토큰 만료 대기
            Thread.sleep(10);

            // when & then
            mockMvc.perform(get("/api/auth/me")
                            .header("Authorization", "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/auth/login/github")
    class LoginWithGitHub {

        @Test
        @DisplayName("GitHub OAuth2 로그인 요청 시 리다이렉트")
        void success() throws Exception {
            mockMvc.perform(get("/api/auth/login/github"))
                    .andExpect(status().is3xxRedirection())
                    .andExpect(redirectedUrl("/oauth2/authorization/github"));
        }
    }
}
