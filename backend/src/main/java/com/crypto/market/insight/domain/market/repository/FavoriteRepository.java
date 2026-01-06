package com.crypto.market.insight.domain.market.repository;

import com.crypto.market.insight.domain.market.model.entity.Favorite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndCoinId(Long userId, String coinId);

    boolean existsByUserIdAndCoinId(Long userId, String coinId);

    void deleteByUserIdAndCoinId(Long userId, String coinId);
}
