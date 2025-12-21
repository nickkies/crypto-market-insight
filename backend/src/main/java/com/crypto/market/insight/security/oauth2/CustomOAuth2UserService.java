package com.crypto.market.insight.security.oauth2;

import com.crypto.market.insight.domain.user.model.entity.User;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import com.crypto.market.insight.domain.user.repository.UserRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        Map<String, Object> attributes = oauth2User.getAttributes();
        String providerId = String.valueOf(attributes.get("id"));
        String email = (String) attributes.get("email");
        String nickname = (String) attributes.get("login");
        String profileImage = (String) attributes.get("avatar_url");

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .map(existingUser -> updateExistingUser(existingUser, nickname, profileImage))
                .orElseGet(() -> createNewUser(email, nickname, profileImage, provider, providerId));

        return new OAuth2UserPrincipal(user, attributes);
    }

    private User updateExistingUser(User user, String nickname, String profileImage) {
        user.updateProfile(nickname, profileImage);
        log.debug("Updated existing user: {}", user.getEmail());
        return user;
    }

    private User createNewUser(String email, String nickname, String profileImage,
                               AuthProvider provider, String providerId) {
        User newUser = User.builder()
                .email(email != null ? email : providerId + "@github.user")
                .nickname(nickname)
                .profileImage(profileImage)
                .provider(provider)
                .providerId(providerId)
                .build();

        User savedUser = userRepository.save(newUser);
        log.debug("Created new user: {}", savedUser.getEmail());
        return savedUser;
    }
}
