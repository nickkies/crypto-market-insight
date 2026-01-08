package com.crypto.market.insight.domain.strategy.model.entity;

import com.crypto.market.insight.domain.strategy.model.vo.StrategyType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(
        name = "backtest_results",
        indexes = @Index(name = "idx_backtest_results_user_id", columnList = "user_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class BacktestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String coinId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StrategyType strategyType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String parameters;

    @Column(nullable = false)
    private String timeframe;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal cumulativeReturn;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal mdd;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal winRate;

    @Column(nullable = false)
    private Integer tradeCount;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public BacktestResult(Long userId, String coinId, StrategyType strategyType,
                          String parameters, String timeframe, LocalDate startDate,
                          LocalDate endDate, BigDecimal cumulativeReturn, BigDecimal mdd,
                          BigDecimal winRate, Integer tradeCount) {
        this.userId = userId;
        this.coinId = coinId;
        this.strategyType = strategyType;
        this.parameters = parameters;
        this.timeframe = timeframe;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cumulativeReturn = cumulativeReturn;
        this.mdd = mdd;
        this.winRate = winRate;
        this.tradeCount = tradeCount;
    }
}
