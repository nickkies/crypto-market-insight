package com.crypto.market.insight.unit.security.oauth2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import com.crypto.market.insight.domain.user.model.entity.User;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import com.crypto.market.insight.security.jwt.JwtTokenProvider;
import com.crypto.market.insight.security.oauth2.OAuth2SuccessHandler;
import com.crypto.market.insight.security.oauth2.OAuth2UserPrincipal;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class OAuth2SuccessHandlerTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        ReflectionTestUtils.setField(oAuth2SuccessHandler, "redirectUri",
                "http://localhost:5173/oauth/callback");
    }

    @Test
    @DisplayName("로그인 성공 시 JWT 토큰과 함께 리다이렉트")
    void onAuthenticationSuccess_ShouldRedirectWithToken() throws Exception {
        User user = User.builder()
                .email("test@github.com")
                .nickname("testuser")
                .profileImage("https://avatar.url")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        OAuth2UserPrincipal principal = new OAuth2UserPrincipal(user, Collections.emptyMap());
        given(authentication.getPrincipal()).willReturn(principal);
        given(jwtTokenProvider.createToken(1L, "test@github.com")).willReturn("test-jwt-token");

        oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

        assertThat(response.getRedirectedUrl())
                .isEqualTo("http://localhost:5173/oauth/callback?token=test-jwt-token");
    }

    @Test
    @DisplayName("리다이렉트 URL에 토큰이 쿼리 파라미터로 포함")
    void onAuthenticationSuccess_ShouldIncludeTokenInQueryParam() throws Exception {
        User user = User.builder()
                .email("user@example.com")
                .nickname("user123")
                .profileImage("https://image.url")
                .provider(AuthProvider.GITHUB)
                .providerId("67890")
                .build();
        ReflectionTestUtils.setField(user, "id", 2L);

        OAuth2UserPrincipal principal = new OAuth2UserPrincipal(user, Collections.emptyMap());
        given(authentication.getPrincipal()).willReturn(principal);
        given(jwtTokenProvider.createToken(2L, "user@example.com")).willReturn("another-jwt-token");

        oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

        String redirectedUrl = response.getRedirectedUrl();
        assertThat(redirectedUrl).contains("token=another-jwt-token");
        assertThat(redirectedUrl).startsWith("http://localhost:5173/oauth/callback");
    }
}
