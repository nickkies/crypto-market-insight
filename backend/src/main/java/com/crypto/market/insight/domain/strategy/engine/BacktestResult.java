package com.crypto.market.insight.domain.strategy.engine;

import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import java.util.List;

/**
 * 백테스트 실행 결과
 */
public record BacktestResult(
        List<Trade> trades,
        PerformanceMetrics metrics
) {
    public static BacktestResult empty() {
        return new BacktestResult(List.of(), PerformanceMetrics.empty());
    }
}
