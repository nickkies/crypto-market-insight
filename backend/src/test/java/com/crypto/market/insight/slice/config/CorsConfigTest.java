package com.crypto.market.insight.slice.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String ALLOWED_ORIGIN = "http://localhost:5173";
    private static final String NOT_ALLOWED_ORIGIN = "http://malicious-site.com";

    @Test
    @DisplayName("허용된 Origin에서 CORS preflight 요청 성공")
    void corsPreflightRequest_ShouldSucceed_WhenOriginIsAllowed() throws Exception {
        mockMvc.perform(options("/api/test")
                        .header(HttpHeaders.ORIGIN, ALLOWED_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN))
                .andExpect(header().exists(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS));
    }

    @Test
    @DisplayName("허용되지 않은 Origin에서 CORS preflight 요청 실패")
    void corsPreflightRequest_ShouldFail_WhenOriginIsNotAllowed() throws Exception {
        mockMvc.perform(options("/api/test")
                        .header(HttpHeaders.ORIGIN, NOT_ALLOWED_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("허용된 Origin에서 credentials 허용")
    void corsRequest_ShouldAllowCredentials_WhenOriginIsAllowed() throws Exception {
        mockMvc.perform(options("/api/test")
                        .header(HttpHeaders.ORIGIN, ALLOWED_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    @Test
    @DisplayName("허용된 HTTP 메서드 확인")
    void corsRequest_ShouldAllowConfiguredMethods() throws Exception {
        mockMvc.perform(options("/api/test")
                        .header(HttpHeaders.ORIGIN, ALLOWED_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "DELETE"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                        org.hamcrest.Matchers.containsString("DELETE")));
    }
}
