package com.crypto.market.insight.domain.strategy.indicator;

import com.crypto.market.insight.domain.market.dto.OhlcvData;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * 기술적 지표 계산기
 */
@Component
public class IndicatorCalculator {

    private static final int SCALE = 8;

    /**
     * RSI(Relative Strength Index) 계산
     *
     * @param candles OHLCV 데이터 리스트
     * @param period  RSI 기간 (기본 14)
     * @return RSI 값 리스트 (0-100), 첫 period-1개는 null
     */
    public List<BigDecimal> calculateRsi(List<OhlcvData> candles, int period) {
        if (candles == null || candles.size() < period + 1) {
            return List.of();
        }

        List<BigDecimal> rsiValues = new ArrayList<>();
        List<BigDecimal> gains = new ArrayList<>();
        List<BigDecimal> losses = new ArrayList<>();

        // 가격 변화 계산
        for (int i = 1; i < candles.size(); i++) {
            BigDecimal change = candles.get(i).close().subtract(candles.get(i - 1).close());
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                gains.add(change);
                losses.add(BigDecimal.ZERO);
            } else {
                gains.add(BigDecimal.ZERO);
                losses.add(change.abs());
            }
        }

        // 첫 period-1개는 RSI 계산 불가
        for (int i = 0; i < period - 1; i++) {
            rsiValues.add(null);
        }

        // 첫 번째 평균 계산 (SMA)
        BigDecimal avgGain = calculateAverage(gains.subList(0, period));
        BigDecimal avgLoss = calculateAverage(losses.subList(0, period));

        rsiValues.add(calculateRsiValue(avgGain, avgLoss));

        // 이후 EMA(Exponential Moving Average) 방식으로 계산
        for (int i = period; i < gains.size(); i++) {
            avgGain = avgGain.multiply(BigDecimal.valueOf(period - 1))
                    .add(gains.get(i))
                    .divide(BigDecimal.valueOf(period), SCALE, RoundingMode.HALF_UP);

            avgLoss = avgLoss.multiply(BigDecimal.valueOf(period - 1))
                    .add(losses.get(i))
                    .divide(BigDecimal.valueOf(period), SCALE, RoundingMode.HALF_UP);

            rsiValues.add(calculateRsiValue(avgGain, avgLoss));
        }

        return rsiValues;
    }

    private BigDecimal calculateAverage(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(values.size()), SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRsiValue(BigDecimal avgGain, BigDecimal avgLoss) {
        if (avgLoss.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(100);
        }
        BigDecimal rs = avgGain.divide(avgLoss, SCALE, RoundingMode.HALF_UP);
        BigDecimal rsi = BigDecimal.valueOf(100)
                .subtract(BigDecimal.valueOf(100)
                        .divide(BigDecimal.ONE.add(rs), SCALE, RoundingMode.HALF_UP));
        return rsi.setScale(2, RoundingMode.HALF_UP);
    }
}
