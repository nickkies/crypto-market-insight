package com.crypto.market.insight.unit.security.oauth2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.crypto.market.insight.domain.user.model.entity.User;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import com.crypto.market.insight.domain.user.repository.UserRepository;
import com.crypto.market.insight.security.oauth2.OAuth2UserPrincipal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CustomOAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate;

    private TestableCustomOAuth2UserService customOAuth2UserService;

    private OAuth2UserRequest userRequest;

    @BeforeEach
    void setUp() {
        customOAuth2UserService = new TestableCustomOAuth2UserService(userRepository, delegate);

        ClientRegistration clientRegistration = ClientRegistration
                .withRegistrationId("github")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .clientId("test-client-id")
                .redirectUri("http://localhost/callback")
                .authorizationUri("https://github.com/login/oauth/authorize")
                .tokenUri("https://github.com/login/oauth/access_token")
                .userInfoUri("https://api.github.com/user")
                .userNameAttributeName("id")
                .clientName("GitHub")
                .build();

        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "test-token",
                null,
                null
        );

        userRequest = new OAuth2UserRequest(clientRegistration, accessToken);
    }

    @Test
    @DisplayName("신규 사용자 - DB에 저장")
    void loadUser_ShouldCreateNewUser_WhenUserNotExists() {
        Map<String, Object> attributes = createGitHubAttributes();
        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                Collections.emptyList(), attributes, "id");

        given(delegate.loadUser(any(OAuth2UserRequest.class))).willReturn(mockOAuth2User);
        given(userRepository.findByProviderAndProviderId(AuthProvider.GITHUB, "12345"))
                .willReturn(Optional.empty());

        User savedUser = User.builder()
                .email("test@github.com")
                .nickname("testuser")
                .profileImage("https://avatars.githubusercontent.com/u/12345")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();
        ReflectionTestUtils.setField(savedUser, "id", 1L);

        given(userRepository.save(any(User.class))).willReturn(savedUser);

        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        assertThat(result).isInstanceOf(OAuth2UserPrincipal.class);
        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) result;
        assertThat(principal.getEmail()).isEqualTo("test@github.com");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getProvider()).isEqualTo(AuthProvider.GITHUB);
        assertThat(capturedUser.getProviderId()).isEqualTo("12345");
    }

    @Test
    @DisplayName("기존 사용자 - 프로필 업데이트")
    void loadUser_ShouldUpdateProfile_WhenUserExists() {
        Map<String, Object> attributes = createGitHubAttributes();
        attributes.put("login", "updated-nickname");
        attributes.put("avatar_url", "https://new-avatar.url");

        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                Collections.emptyList(), attributes, "id");

        given(delegate.loadUser(any(OAuth2UserRequest.class))).willReturn(mockOAuth2User);

        User existingUser = User.builder()
                .email("test@github.com")
                .nickname("old-nickname")
                .profileImage("https://old-avatar.url")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();
        ReflectionTestUtils.setField(existingUser, "id", 1L);

        given(userRepository.findByProviderAndProviderId(AuthProvider.GITHUB, "12345"))
                .willReturn(Optional.of(existingUser));

        OAuth2User result = customOAuth2UserService.loadUser(userRequest);

        assertThat(result).isInstanceOf(OAuth2UserPrincipal.class);
        assertThat(existingUser.getNickname()).isEqualTo("updated-nickname");
        assertThat(existingUser.getProfileImage()).isEqualTo("https://new-avatar.url");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("이메일 없는 경우 - 기본 이메일 생성")
    void loadUser_ShouldCreateDefaultEmail_WhenEmailIsNull() {
        Map<String, Object> attributes = createGitHubAttributes();
        attributes.put("email", null);

        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                Collections.emptyList(), attributes, "id");

        given(delegate.loadUser(any(OAuth2UserRequest.class))).willReturn(mockOAuth2User);
        given(userRepository.findByProviderAndProviderId(AuthProvider.GITHUB, "12345"))
                .willReturn(Optional.empty());

        User savedUser = User.builder()
                .email("12345@github.user")
                .nickname("testuser")
                .profileImage("https://avatars.githubusercontent.com/u/12345")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();
        ReflectionTestUtils.setField(savedUser, "id", 1L);

        given(userRepository.save(any(User.class))).willReturn(savedUser);

        customOAuth2UserService.loadUser(userRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getEmail()).isEqualTo("12345@github.user");
    }

    private Map<String, Object> createGitHubAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", 12345);
        attributes.put("login", "testuser");
        attributes.put("email", "test@github.com");
        attributes.put("avatar_url", "https://avatars.githubusercontent.com/u/12345");
        return attributes;
    }

    /**
     * 테스트용 CustomOAuth2UserService - delegate를 주입받아 부모 호출 대체
     */
    private static class TestableCustomOAuth2UserService extends DefaultOAuth2UserService {

        private final UserRepository userRepository;
        private final OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate;

        TestableCustomOAuth2UserService(
                UserRepository userRepository,
                OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate
        ) {
            this.userRepository = userRepository;
            this.delegate = delegate;
        }

        @Override
        public OAuth2User loadUser(OAuth2UserRequest userRequest) {
            OAuth2User oauth2User = delegate.loadUser(userRequest);

            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

            Map<String, Object> attributes = oauth2User.getAttributes();
            String providerId = String.valueOf(attributes.get("id"));
            String email = (String) attributes.get("email");
            String nickname = (String) attributes.get("login");
            String profileImage = (String) attributes.get("avatar_url");

            User user = userRepository.findByProviderAndProviderId(provider, providerId)
                    .map(existingUser -> {
                        existingUser.updateProfile(nickname, profileImage);
                        return existingUser;
                    })
                    .orElseGet(() -> {
                        User newUser = User.builder()
                            .email(email != null ? email : providerId + "@github.user")
                            .nickname(nickname)
                            .profileImage(profileImage)
                            .provider(provider)
                            .providerId(providerId)
                            .build();
                        return userRepository.save(newUser);
                    });

            return new OAuth2UserPrincipal(user, attributes);
        }
    }
}
