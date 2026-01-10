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
    private static final int RESULT_SCALE = 2;

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

    /**
     * SMA(Simple Moving Average) 계산
     *
     * @param candles OHLCV 데이터 리스트
     * @param period  이동평균 기간
     * @return SMA 값 리스트, 첫 period-1개는 null
     */
    public List<BigDecimal> calculateSma(List<OhlcvData> candles, int period) {
        if (candles == null || candles.size() < period) {
            return List.of();
        }

        List<BigDecimal> smaValues = new ArrayList<>();

        // 첫 period-1개는 SMA 계산 불가
        for (int i = 0; i < period - 1; i++) {
            smaValues.add(null);
        }

        // SMA 계산
        for (int i = period - 1; i < candles.size(); i++) {
            BigDecimal sum = BigDecimal.ZERO;
            for (int j = i - period + 1; j <= i; j++) {
                sum = sum.add(candles.get(j).close());
            }
            BigDecimal sma = sum.divide(BigDecimal.valueOf(period), SCALE, RoundingMode.HALF_UP);
            smaValues.add(sma.setScale(RESULT_SCALE, RoundingMode.HALF_UP));
        }

        return smaValues;
    }

    /**
     * EMA(Exponential Moving Average) 계산
     *
     * @param candles OHLCV 데이터 리스트
     * @param period  EMA 기간
     * @return EMA 값 리스트, 첫 period-1개는 null
     */
    public List<BigDecimal> calculateEma(List<OhlcvData> candles, int period) {
        if (candles == null || candles.size() < period) {
            return List.of();
        }

        List<BigDecimal> emaValues = new ArrayList<>();

        // 첫 period-1개는 EMA 계산 불가
        for (int i = 0; i < period - 1; i++) {
            emaValues.add(null);
        }

        // 첫 EMA = 첫 SMA
        BigDecimal sum = BigDecimal.ZERO;
        for (int i = 0; i < period; i++) {
            sum = sum.add(candles.get(i).close());
        }
        BigDecimal ema = sum.divide(BigDecimal.valueOf(period), SCALE, RoundingMode.HALF_UP);
        emaValues.add(ema.setScale(RESULT_SCALE, RoundingMode.HALF_UP));

        // EMA 계산: EMA = (Close - EMA_prev) * multiplier + EMA_prev
        BigDecimal multiplier = BigDecimal.valueOf(2.0 / (period + 1));

        for (int i = period; i < candles.size(); i++) {
            BigDecimal close = candles.get(i).close();
            ema = close.subtract(ema).multiply(multiplier).add(ema);
            emaValues.add(ema.setScale(RESULT_SCALE, RoundingMode.HALF_UP));
        }

        return emaValues;
    }

    /**
     * MACD(Moving Average Convergence Divergence) 계산
     *
     * @param candles     OHLCV 데이터 리스트
     * @param fastPeriod  빠른 EMA 기간 (기본 12)
     * @param slowPeriod  느린 EMA 기간 (기본 26)
     * @param signalPeriod 시그널 EMA 기간 (기본 9)
     * @return MACD 결과 (macdLine, signalLine, histogram)
     */
    public MacdResult calculateMacd(List<OhlcvData> candles, int fastPeriod, int slowPeriod, int signalPeriod) {
        if (candles == null || candles.size() < slowPeriod + signalPeriod) {
            return new MacdResult(List.of(), List.of(), List.of());
        }

        List<BigDecimal> fastEma = calculateEma(candles, fastPeriod);
        List<BigDecimal> slowEma = calculateEma(candles, slowPeriod);

        // MACD Line = Fast EMA - Slow EMA
        List<BigDecimal> macdLine = new ArrayList<>();
        for (int i = 0; i < candles.size(); i++) {
            BigDecimal fast = i < fastEma.size() ? fastEma.get(i) : null;
            BigDecimal slow = i < slowEma.size() ? slowEma.get(i) : null;

            if (fast == null || slow == null) {
                macdLine.add(null);
            } else {
                macdLine.add(fast.subtract(slow).setScale(RESULT_SCALE, RoundingMode.HALF_UP));
            }
        }

        // Signal Line = MACD Line의 EMA
        List<BigDecimal> signalLine = calculateEmaFromValues(macdLine, signalPeriod);

        // Histogram = MACD Line - Signal Line
        List<BigDecimal> histogram = new ArrayList<>();
        for (int i = 0; i < macdLine.size(); i++) {
            BigDecimal macd = macdLine.get(i);
            BigDecimal signal = i < signalLine.size() ? signalLine.get(i) : null;

            if (macd == null || signal == null) {
                histogram.add(null);
            } else {
                histogram.add(macd.subtract(signal).setScale(RESULT_SCALE, RoundingMode.HALF_UP));
            }
        }

        return new MacdResult(macdLine, signalLine, histogram);
    }

    /**
     * Bollinger Bands 계산
     *
     * @param candles OHLCV 데이터 리스트
     * @param period  이동평균 기간 (기본 20)
     * @param stdDev  표준편차 배수 (기본 2)
     * @return Bollinger Bands 결과 (upper, middle, lower)
     */
    public BollingerBandsResult calculateBollingerBands(List<OhlcvData> candles, int period, double stdDev) {
        if (candles == null || candles.size() < period) {
            return new BollingerBandsResult(List.of(), List.of(), List.of());
        }

        List<BigDecimal> middle = calculateSma(candles, period);
        List<BigDecimal> upper = new ArrayList<>();
        List<BigDecimal> lower = new ArrayList<>();

        // 첫 period-1개는 null
        for (int i = 0; i < period - 1; i++) {
            upper.add(null);
            lower.add(null);
        }

        // 표준편차 계산 및 밴드 생성
        for (int i = period - 1; i < candles.size(); i++) {
            BigDecimal sma = middle.get(i);

            // 표준편차 계산
            BigDecimal sumSquaredDiff = BigDecimal.ZERO;
            for (int j = i - period + 1; j <= i; j++) {
                BigDecimal diff = candles.get(j).close().subtract(sma);
                sumSquaredDiff = sumSquaredDiff.add(diff.multiply(diff));
            }
            BigDecimal variance = sumSquaredDiff.divide(BigDecimal.valueOf(period), SCALE, RoundingMode.HALF_UP);
            BigDecimal std = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()));

            BigDecimal stdDevMultiplier = BigDecimal.valueOf(stdDev);
            upper.add(sma.add(std.multiply(stdDevMultiplier)).setScale(RESULT_SCALE, RoundingMode.HALF_UP));
            lower.add(sma.subtract(std.multiply(stdDevMultiplier)).setScale(RESULT_SCALE, RoundingMode.HALF_UP));
        }

        return new BollingerBandsResult(upper, middle, lower);
    }

    private List<BigDecimal> calculateEmaFromValues(List<BigDecimal> values, int period) {
        List<BigDecimal> emaValues = new ArrayList<>();

        // 첫 번째 non-null 값 인덱스 찾기
        int firstNonNullIndex = -1;
        for (int i = 0; i < values.size(); i++) {
            if (values.get(i) != null) {
                firstNonNullIndex = i;
                break;
            }
        }

        if (firstNonNullIndex < 0 || values.size() - firstNonNullIndex < period) {
            for (int i = 0; i < values.size(); i++) {
                emaValues.add(null);
            }
            return emaValues;
        }

        // 첫 non-null 이전까지 null
        for (int i = 0; i < firstNonNullIndex + period - 1; i++) {
            emaValues.add(null);
        }

        // 첫 EMA = 첫 SMA
        BigDecimal sum = BigDecimal.ZERO;
        for (int i = firstNonNullIndex; i < firstNonNullIndex + period; i++) {
            sum = sum.add(values.get(i));
        }
        BigDecimal ema = sum.divide(BigDecimal.valueOf(period), SCALE, RoundingMode.HALF_UP);
        emaValues.add(ema.setScale(RESULT_SCALE, RoundingMode.HALF_UP));

        // EMA 계산
        BigDecimal multiplier = BigDecimal.valueOf(2.0 / (period + 1));
        for (int i = firstNonNullIndex + period; i < values.size(); i++) {
            BigDecimal value = values.get(i);
            if (value == null) {
                emaValues.add(null);
            } else {
                ema = value.subtract(ema).multiply(multiplier).add(ema);
                emaValues.add(ema.setScale(RESULT_SCALE, RoundingMode.HALF_UP));
            }
        }

        return emaValues;
    }

    /**
     * MACD 계산 결과
     */
    public record MacdResult(
            List<BigDecimal> macdLine,
            List<BigDecimal> signalLine,
            List<BigDecimal> histogram
    ) {}

    /**
     * Bollinger Bands 계산 결과
     */
    public record BollingerBandsResult(
            List<BigDecimal> upper,
            List<BigDecimal> middle,
            List<BigDecimal> lower
    ) {}
}
