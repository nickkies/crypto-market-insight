package com.crypto.market.insight.domain.user.repository;

import com.crypto.market.insight.domain.user.model.entity.User;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);
}
