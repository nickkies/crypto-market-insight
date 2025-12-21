package com.crypto.market.insight.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.crypto.market.insight.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class JwtAuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("유효한 JWT 토큰으로 인증 성공 (401이 아닌 응답)")
    void protectedApi_ShouldAuthenticate_WhenValidToken() throws Exception {
        String token = jwtTokenProvider.createToken(1L, "test@github.com");

        // 인증 성공 시 401이 아닌 다른 응답
        mockMvc.perform(get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(result ->
                        org.assertj.core.api.Assertions.assertThat(
                                result.getResponse().getStatus()).isNotEqualTo(401));
    }

    @Test
    @DisplayName("토큰 없이 보호된 API 접근 시 401 반환")
    void protectedApi_ShouldReturn401_WhenNoToken() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("인증이 필요합니다"));
    }

    @Test
    @DisplayName("유효하지 않은 토큰으로 보호된 API 접근 시 401 반환")
    void protectedApi_ShouldReturn401_WhenInvalidToken() throws Exception {
        mockMvc.perform(get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("만료된 토큰으로 보호된 API 접근 시 401 반환")
    void protectedApi_ShouldReturn401_WhenExpiredToken() throws Exception {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(
                "test-secret-key-for-jwt-token-must-be-at-least-256-bits", 1L);
        String expiredToken = shortLivedProvider.createToken(1L, "test@github.com");

        Thread.sleep(10);

        mockMvc.perform(get("/api/test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Public URL은 토큰 없이 접근 가능")
    void publicApi_ShouldSucceed_WhenNoToken() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
