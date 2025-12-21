package com.crypto.market.insight.unit.security.oauth2;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.user.model.entity.User;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import com.crypto.market.insight.security.oauth2.OAuth2UserPrincipal;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

class OAuth2UserPrincipalTest {

    private User user;
    private Map<String, Object> attributes;
    private OAuth2UserPrincipal principal;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .email("test@github.com")
                .nickname("testuser")
                .profileImage("https://avatar.url")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        attributes = new HashMap<>();
        attributes.put("id", 12345);
        attributes.put("login", "testuser");

        principal = new OAuth2UserPrincipal(user, attributes);
    }

    @Test
    @DisplayName("getName()은 userId를 반환")
    void getName_ShouldReturnUserId() {
        assertThat(principal.getName()).isEqualTo("1");
    }

    @Test
    @DisplayName("getUserId()는 User의 id를 반환")
    void getUserId_ShouldReturnUserId() {
        assertThat(principal.getUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getEmail()은 User의 email을 반환")
    void getEmail_ShouldReturnUserEmail() {
        assertThat(principal.getEmail()).isEqualTo("test@github.com");
    }

    @Test
    @DisplayName("getAttributes()는 OAuth2 속성을 반환")
    void getAttributes_ShouldReturnOAuth2Attributes() {
        assertThat(principal.getAttributes()).containsEntry("id", 12345);
        assertThat(principal.getAttributes()).containsEntry("login", "testuser");
    }

    @Test
    @DisplayName("getAuthorities()는 ROLE_USER 권한을 포함")
    void getAuthorities_ShouldContainRoleUser() {
        assertThat(principal.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");
    }

    @Test
    @DisplayName("getUser()는 User 엔티티를 반환")
    void getUser_ShouldReturnUserEntity() {
        assertThat(principal.getUser()).isEqualTo(user);
        assertThat(principal.getUser().getNickname()).isEqualTo("testuser");
    }
}
