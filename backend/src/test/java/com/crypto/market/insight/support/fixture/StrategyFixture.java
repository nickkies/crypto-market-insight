package com.crypto.market.insight.support.fixture;

import com.crypto.market.insight.domain.strategy.model.vo.RsiParameters;
import com.crypto.market.insight.domain.strategy.model.vo.Trade;
import com.crypto.market.insight.domain.strategy.signal.RsiSignalGenerator;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class StrategyFixture {

    private StrategyFixture() {
    }

    // === RSI Parameters ===

    public static RsiParameters defaultRsiParameters() {
        return new RsiParameters(14, 30, 70);
    }

    // === Signal Generators ===

    public static RsiSignalGenerator defaultRsiSignalGenerator() {
        return new RsiSignalGenerator(defaultRsiParameters());
    }

    // === Indicator Values ===

    /**
     * BUY → 진입 → SELL → 청산 시나리오
     */
    public static List<BigDecimal> buyThenSellIndicators() {
        return List.of(
                BigDecimal.valueOf(25),  // BUY 시그널
                BigDecimal.valueOf(50),  // 진입
                BigDecimal.valueOf(75),  // SELL 시그널
                BigDecimal.valueOf(50),  // 청산
                BigDecimal.valueOf(50)
        );
    }

    /**
     * BUY 후 추가 BUY 무시 시나리오
     */
    public static List<BigDecimal> multipleBuyIndicators() {
        return List.of(
                BigDecimal.valueOf(25),  // BUY
                BigDecimal.valueOf(50),  // 진입
                BigDecimal.valueOf(25),  // BUY (무시됨)
                BigDecimal.valueOf(25),  // BUY (무시됨)
                BigDecimal.valueOf(75),  // SELL
                BigDecimal.valueOf(50)   // 청산
        );
    }

    /**
     * 포지션 없이 SELL 시그널 시나리오
     */
    public static List<BigDecimal> sellWithoutPositionIndicators() {
        return List.of(
                BigDecimal.valueOf(75),  // SELL (무시됨)
                BigDecimal.valueOf(75),  // SELL (무시됨)
                BigDecimal.valueOf(50),
                BigDecimal.valueOf(50)
        );
    }

    /**
     * 강제 청산 시나리오
     */
    public static List<BigDecimal> forceCloseIndicators() {
        return List.of(
                BigDecimal.valueOf(25),  // BUY
                BigDecimal.valueOf(50),  // 진입
                BigDecimal.valueOf(50)   // 강제 청산
        );
    }

    /**
     * 수수료/슬리피지 테스트용 (동일 가격)
     */
    public static List<BigDecimal> feeTestIndicators() {
        return List.of(
                BigDecimal.valueOf(25),  // BUY
                BigDecimal.valueOf(50),  // 진입
                BigDecimal.valueOf(75),  // SELL
                BigDecimal.valueOf(50)   // 청산
        );
    }

    // === Trade Fixtures ===

    public static Trade createTrade(BigDecimal profit) {
        return new Trade(
                Instant.now(),
                Instant.now(),
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(100),
                BigDecimal.ONE,
                profit,
                profit
        );
    }

    public static List<Trade> winLossTrades() {
        return List.of(
                createTrade(BigDecimal.valueOf(100)),   // win
                createTrade(BigDecimal.valueOf(-50)),   // loss
                createTrade(BigDecimal.valueOf(200)),   // win
                createTrade(BigDecimal.valueOf(-100))   // loss
        );
    }

    /**
     * MDD 테스트용: 100 → +20 (120) → -40 (80) → +30 (110)
     * Peak: 120, Drawdown: (120-80)/120 = 33.33%
     */
    public static List<Trade> mddTestTrades() {
        return List.of(
                createTrade(BigDecimal.valueOf(20)),
                createTrade(BigDecimal.valueOf(-40)),
                createTrade(BigDecimal.valueOf(30))
        );
    }
}
