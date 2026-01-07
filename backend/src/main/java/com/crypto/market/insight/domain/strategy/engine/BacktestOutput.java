package com.crypto.market.insight.domain.strategy.engine;

import com.crypto.market.insight.domain.strategy.model.vo.PerformanceMetrics;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import java.util.List;

/**
 * 백테스트 실행 결과 (엔진 출력용)
 */
public record BacktestOutput(
        List<Trade> trades,
        PerformanceMetrics metrics
) {
    public static BacktestOutput empty() {
        return new BacktestOutput(List.of(), PerformanceMetrics.empty());
    }
}
