package com.crypto.market.insight.slice.domain.user.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.crypto.market.insight.domain.user.model.entity.User;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import com.crypto.market.insight.domain.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import com.crypto.market.insight.config.JpaAuditingConfig;

@DataJpaTest
@Import(JpaAuditingConfig.class)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("User 저장 시 Auditing 필드 자동 생성")
    void save_ShouldSetAuditFields() {
        User user = User.builder()
                .email("test@github.com")
                .nickname("testuser")
                .profileImage("https://avatars.githubusercontent.com/u/12345")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();

        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Provider와 ProviderId로 사용자 조회")
    void findByProviderAndProviderId_ShouldReturnUser() {
        User user = User.builder()
                .email("test@github.com")
                .nickname("testuser")
                .provider(AuthProvider.GITHUB)
                .providerId("12345")
                .build();
        userRepository.save(user);

        Optional<User> found = userRepository.findByProviderAndProviderId(
                AuthProvider.GITHUB, "12345");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@github.com");
    }

    @Test
    @DisplayName("존재하지 않는 ProviderId로 조회 시 빈 Optional 반환")
    void findByProviderAndProviderId_ShouldReturnEmpty_WhenNotFound() {
        Optional<User> found = userRepository.findByProviderAndProviderId(
                AuthProvider.GITHUB, "nonexistent");

        assertThat(found).isEmpty();
    }
}
