package com.crypto.market.insight.domain.market.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

public class IndicatorDto {

    @Schema(description = "기술적 지표 응답")
    public record IndicatorResponse(
            @Schema(description = "코인 ID", example = "bitcoin")
            String coinId,

            @Schema(description = "RSI 지표")
            RsiIndicator rsi,

            @Schema(description = "MACD 지표")
            MacdIndicator macd,

            @Schema(description = "이동평균 지표")
            MaIndicator ma,

            @Schema(description = "볼린저 밴드 지표")
            BollingerBandsIndicator bollingerBands
    ) {
        public static IndicatorResponse of(
                String coinId,
                RsiIndicator rsi,
                MacdIndicator macd,
                MaIndicator ma,
                BollingerBandsIndicator bollingerBands
        ) {
            return new IndicatorResponse(coinId, rsi, macd, ma, bollingerBands);
        }
    }

    @Schema(description = "RSI 지표")
    public record RsiIndicator(
            @Schema(description = "RSI 값 (0-100)", example = "45.67")
            BigDecimal value,

            @Schema(description = "상태 (OVERBOUGHT, OVERSOLD, NEUTRAL)", example = "NEUTRAL")
            String status
    ) {
        public static RsiIndicator of(BigDecimal value) {
            if (value == null) {
                return new RsiIndicator(null, null);
            }
            String status = determineRsiStatus(value);
            return new RsiIndicator(value, status);
        }

        private static String determineRsiStatus(BigDecimal value) {
            if (value.compareTo(BigDecimal.valueOf(70)) >= 0) {
                return "OVERBOUGHT";
            } else if (value.compareTo(BigDecimal.valueOf(30)) <= 0) {
                return "OVERSOLD";
            }
            return "NEUTRAL";
        }
    }

    @Schema(description = "MACD 지표")
    public record MacdIndicator(
            @Schema(description = "MACD 라인 값", example = "123.45")
            BigDecimal macd,

            @Schema(description = "시그널 라인 값", example = "120.00")
            BigDecimal signal,

            @Schema(description = "히스토그램 값", example = "3.45")
            BigDecimal histogram,

            @Schema(description = "상태 (BULLISH, BEARISH)", example = "BULLISH")
            String status
    ) {
        public static MacdIndicator of(BigDecimal macd, BigDecimal signal, BigDecimal histogram) {
            if (macd == null || signal == null) {
                return new MacdIndicator(macd, signal, histogram, null);
            }
            String status = macd.compareTo(signal) > 0 ? "BULLISH" : "BEARISH";
            return new MacdIndicator(macd, signal, histogram, status);
        }
    }

    @Schema(description = "이동평균 지표")
    public record MaIndicator(
            @Schema(description = "20일 단순 이동평균", example = "95000.00")
            BigDecimal ma20,

            @Schema(description = "50일 단순 이동평균", example = "92000.00")
            BigDecimal ma50
    ) {
        public static MaIndicator of(BigDecimal ma20, BigDecimal ma50) {
            return new MaIndicator(ma20, ma50);
        }
    }

    @Schema(description = "볼린저 밴드 지표")
    public record BollingerBandsIndicator(
            @Schema(description = "상단 밴드", example = "98000.00")
            BigDecimal upper,

            @Schema(description = "중간 밴드 (20일 SMA)", example = "95000.00")
            BigDecimal middle,

            @Schema(description = "하단 밴드", example = "92000.00")
            BigDecimal lower
    ) {
        public static BollingerBandsIndicator of(BigDecimal upper, BigDecimal middle, BigDecimal lower) {
            return new BollingerBandsIndicator(upper, middle, lower);
        }
    }
}
