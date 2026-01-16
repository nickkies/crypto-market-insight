package com.crypto.market.insight.domain.strategy.signal;

import com.crypto.market.insight.domain.strategy.model.vo.Signal;
import java.math.BigDecimal;

/**
 * Moving Average Crossover 기반 시그널 생성기
 * - 단기 MA가 장기 MA를 상향 돌파 (골든 크로스) → BUY
 * - 단기 MA가 장기 MA를 하향 돌파 (데드 크로스) → SELL
 * - 그 외 → HOLD
 *
 * indicatorValue: shortMA - longMA
 * 참고: 0을 거쳐가는 크로스오버도 감지 (음수 → 0 → 양수 = BUY)
 */
public class MovingAverageCrossoverSignalGenerator implements SignalGenerator {

    // 마지막으로 0이 아니었던 값의 부호 (1=양수, -1=음수, 0=아직 없음)
    private int lastNonZeroSign = 0;

    @Override
    public Signal generate(BigDecimal maDiff) {
        if (maDiff == null) {
            return Signal.HOLD;
        }

        Signal signal = Signal.HOLD;
        int currentSign = maDiff.signum(); // -1, 0, or 1

        // 현재 값이 0이 아니고, 이전에 반대쪽이었으면 크로스오버
        if (currentSign != 0 && lastNonZeroSign != 0) {
            if (lastNonZeroSign < 0 && currentSign > 0) {
                // 골든 크로스: 단기 MA가 장기 MA 상향 돌파
                signal = Signal.BUY;
            } else if (lastNonZeroSign > 0 && currentSign < 0) {
                // 데드 크로스: 단기 MA가 장기 MA 하향 돌파
                signal = Signal.SELL;
            }
        }

        // 0이 아닌 경우에만 부호 업데이트
        if (currentSign != 0) {
            lastNonZeroSign = currentSign;
        }

        return signal;
    }
}
