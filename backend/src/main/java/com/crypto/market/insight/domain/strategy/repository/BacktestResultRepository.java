package com.crypto.market.insight.domain.strategy.repository;

import com.crypto.market.insight.domain.strategy.model.entity.BacktestResult;
import com.crypto.market.insight.domain.strategy.model.vo.StrategyType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BacktestResultRepository extends JpaRepository<BacktestResult, Long> {

    List<BacktestResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<BacktestResult> findByUserIdAndCoinIdOrderByCreatedAtDesc(Long userId, String coinId);

    List<BacktestResult> findByUserIdAndStrategyTypeOrderByCreatedAtDesc(Long userId, StrategyType strategyType);
}
