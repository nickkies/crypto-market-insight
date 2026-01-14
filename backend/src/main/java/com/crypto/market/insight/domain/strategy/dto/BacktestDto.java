package com.crypto.market.insight.domain.strategy.dto;

import com.crypto.market.insight.domain.strategy.model.vo.StrategyType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class BacktestDto {

    @Schema(description = "백테스트 실행 요청")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public static class Request {

        @Schema(description = "코인 ID", example = "bitcoin")
        @NotBlank(message = "코인 ID는 필수입니다")
        private String coinId;

        @Schema(description = "전략 타입", example = "RSI")
        @NotNull(message = "전략 타입은 필수입니다")
        private StrategyType strategyType;

        @Schema(description = "RSI 파라미터 (strategyType이 RSI일 때)")
        @Valid
        private RsiParameterDto rsiParameters;

        @Schema(description = "MACD 파라미터 (strategyType이 MACD일 때)")
        @Valid
        private MacdParameterDto macdParameters;

        @Schema(description = "Bollinger Bands 파라미터 (strategyType이 BOLLINGER_BANDS일 때)")
        @Valid
        private BollingerBandsParameterDto bollingerBandsParameters;

        @Schema(description = "Moving Average 파라미터 (strategyType이 MOVING_AVERAGE일 때)")
        @Valid
        private MovingAverageParameterDto movingAverageParameters;

        @Schema(description = "타임프레임 (1d=90일, 3d=180일, 1w=365일)", example = "1d")
        @NotBlank(message = "타임프레임은 필수입니다")
        private String timeframe;

        @Schema(description = "종료 날짜 (미입력시 오늘)", example = "2026-01-11")
        private LocalDate endDate;

        // Backward compatibility: 기존 parameters 필드 지원
        @Schema(description = "RSI 파라미터 (deprecated, rsiParameters 사용 권장)", hidden = true)
        @Valid
        private RsiParameterDto parameters;

        /**
         * 전략 타입에 맞는 필수 period 값 반환 (데이터 충분성 검증용)
         */
        public int getRequiredPeriod() {
            return switch (strategyType) {
                case RSI -> getRsiParams().getPeriod();
                case MACD -> getMacdParams().getSlowPeriod() + getMacdParams().getSignalPeriod();
                case BOLLINGER_BANDS -> getBollingerBandsParams().getPeriod();
                case MOVING_AVERAGE -> getMovingAverageParams().getLongPeriod();
            };
        }

        public RsiParameterDto getRsiParams() {
            return rsiParameters != null ? rsiParameters : parameters;
        }

        public MacdParameterDto getMacdParams() {
            return macdParameters != null ? macdParameters : MacdParameterDto.defaultParams();
        }

        public BollingerBandsParameterDto getBollingerBandsParams() {
            return bollingerBandsParameters != null ? bollingerBandsParameters
                    : BollingerBandsParameterDto.defaultParams();
        }

        public MovingAverageParameterDto getMovingAverageParams() {
            return movingAverageParameters != null ? movingAverageParameters
                    : MovingAverageParameterDto.defaultParams();
        }

        /**
         * 종료일 반환 (없으면 오늘)
         */
        public LocalDate getEffectiveEndDate() {
            return endDate != null ? endDate : LocalDate.now();
        }
    }

    @Schema(description = "RSI 파라미터")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    @AllArgsConstructor
    @Builder
    public static class RsiParameterDto {

        @Schema(description = "RSI 기간", example = "14")
        @NotNull(message = "period는 필수입니다")
        @Min(value = 2, message = "period는 2 이상이어야 합니다")
        @Max(value = 100, message = "period는 100 이하여야 합니다")
        private Integer period;

        @Schema(description = "과매도 기준", example = "30")
        @NotNull(message = "oversold는 필수입니다")
        @Min(value = 0, message = "oversold는 0 이상이어야 합니다")
        @Max(value = 100, message = "oversold는 100 이하여야 합니다")
        private Integer oversold;

        @Schema(description = "과매수 기준", example = "70")
        @NotNull(message = "overbought는 필수입니다")
        @Min(value = 0, message = "overbought는 0 이상이어야 합니다")
        @Max(value = 100, message = "overbought는 100 이하여야 합니다")
        private Integer overbought;

        public static RsiParameterDto defaultParams() {
            return RsiParameterDto.builder()
                    .period(7)
                    .oversold(45)
                    .overbought(55)
                    .build();
        }
    }

    @Schema(description = "MACD 파라미터")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    @AllArgsConstructor
    @Builder
    public static class MacdParameterDto {

        @Schema(description = "빠른 EMA 기간", example = "12")
        @NotNull(message = "fastPeriod는 필수입니다")
        @Min(value = 2, message = "fastPeriod는 2 이상이어야 합니다")
        @Max(value = 50, message = "fastPeriod는 50 이하여야 합니다")
        private Integer fastPeriod;

        @Schema(description = "느린 EMA 기간", example = "26")
        @NotNull(message = "slowPeriod는 필수입니다")
        @Min(value = 2, message = "slowPeriod는 2 이상이어야 합니다")
        @Max(value = 100, message = "slowPeriod는 100 이하여야 합니다")
        private Integer slowPeriod;

        @Schema(description = "시그널 EMA 기간", example = "9")
        @NotNull(message = "signalPeriod는 필수입니다")
        @Min(value = 2, message = "signalPeriod는 2 이상이어야 합니다")
        @Max(value = 50, message = "signalPeriod는 50 이하여야 합니다")
        private Integer signalPeriod;

        public static MacdParameterDto defaultParams() {
            return MacdParameterDto.builder()
                    .fastPeriod(5)
                    .slowPeriod(13)
                    .signalPeriod(6)
                    .build();
        }
    }

    @Schema(description = "Bollinger Bands 파라미터")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    @AllArgsConstructor
    @Builder
    public static class BollingerBandsParameterDto {

        @Schema(description = "이동평균 기간", example = "20")
        @NotNull(message = "period는 필수입니다")
        @Min(value = 2, message = "period는 2 이상이어야 합니다")
        @Max(value = 100, message = "period는 100 이하여야 합니다")
        private Integer period;

        @Schema(description = "표준편차 배수", example = "2.0")
        @NotNull(message = "stdDev는 필수입니다")
        @Min(value = 1, message = "stdDev는 1 이상이어야 합니다")
        @Max(value = 5, message = "stdDev는 5 이하여야 합니다")
        private Double stdDev;

        public static BollingerBandsParameterDto defaultParams() {
            return BollingerBandsParameterDto.builder()
                    .period(10)
                    .stdDev(1.5)
                    .build();
        }
    }

    @Schema(description = "Moving Average Crossover 파라미터")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    @AllArgsConstructor
    @Builder
    public static class MovingAverageParameterDto {

        @Schema(description = "단기 이동평균 기간", example = "10")
        @NotNull(message = "shortPeriod는 필수입니다")
        @Min(value = 2, message = "shortPeriod는 2 이상이어야 합니다")
        @Max(value = 50, message = "shortPeriod는 50 이하여야 합니다")
        private Integer shortPeriod;

        @Schema(description = "장기 이동평균 기간", example = "20")
        @NotNull(message = "longPeriod는 필수입니다")
        @Min(value = 2, message = "longPeriod는 2 이상이어야 합니다")
        @Max(value = 200, message = "longPeriod는 200 이하여야 합니다")
        private Integer longPeriod;

        public static MovingAverageParameterDto defaultParams() {
            return MovingAverageParameterDto.builder()
                    .shortPeriod(3)
                    .longPeriod(10)
                    .build();
        }
    }

    @Schema(description = "백테스트 결과")
    @Data
    @Builder
    @AllArgsConstructor
    public static class Response {

        @Schema(description = "백테스트 ID")
        private Long id;

        @Schema(description = "코인 ID")
        private String coinId;

        @Schema(description = "전략 타입")
        private StrategyType strategyType;

        @Schema(description = "RSI 파라미터 (deprecated)")
        private RsiParameterDto parameters;

        @Schema(description = "RSI 파라미터")
        private RsiParameterDto rsiParameters;

        @Schema(description = "MACD 파라미터")
        private MacdParameterDto macdParameters;

        @Schema(description = "Bollinger Bands 파라미터")
        private BollingerBandsParameterDto bollingerBandsParameters;

        @Schema(description = "Moving Average 파라미터")
        private MovingAverageParameterDto movingAverageParameters;

        @Schema(description = "타임프레임")
        private String timeframe;

        @Schema(description = "시작 날짜 (타임프레임 기반 자동 계산)")
        private LocalDate startDate;

        @Schema(description = "종료 날짜")
        private LocalDate endDate;

        @Schema(description = "성과 지표")
        private MetricsDto metrics;

        @Schema(description = "거래 내역")
        private List<TradeDto> trades;

        @Schema(description = "차트 데이터 (OHLCV + 지표)")
        private ChartDataDto chartData;

        @Schema(description = "생성 시각")
        private LocalDateTime createdAt;
    }

    @Schema(description = "차트 데이터")
    @Data
    @Builder
    @AllArgsConstructor
    public static class ChartDataDto {

        @Schema(description = "타임스탬프 목록")
        private List<Long> timestamps;

        @Schema(description = "OHLCV 데이터")
        private List<OhlcvDto> ohlcv;

        @Schema(description = "지표 값 (전략에 따라 다름)")
        private IndicatorValuesDto indicators;
    }

    @Schema(description = "OHLCV 데이터")
    @Data
    @Builder
    @AllArgsConstructor
    public static class OhlcvDto {

        private Long timestamp;
        private BigDecimal open;
        private BigDecimal high;
        private BigDecimal low;
        private BigDecimal close;
        private BigDecimal volume;
    }

    @Schema(description = "지표 값")
    @Data
    @Builder
    @AllArgsConstructor
    public static class IndicatorValuesDto {

        @Schema(description = "RSI 값 목록")
        private List<BigDecimal> rsi;

        @Schema(description = "MACD 라인")
        private List<BigDecimal> macdLine;

        @Schema(description = "시그널 라인")
        private List<BigDecimal> signalLine;

        @Schema(description = "히스토그램")
        private List<BigDecimal> histogram;

        @Schema(description = "볼린저 밴드 상단")
        private List<BigDecimal> bbUpper;

        @Schema(description = "볼린저 밴드 중간")
        private List<BigDecimal> bbMiddle;

        @Schema(description = "볼린저 밴드 하단")
        private List<BigDecimal> bbLower;

        @Schema(description = "단기 이동평균")
        private List<BigDecimal> maShort;

        @Schema(description = "장기 이동평균")
        private List<BigDecimal> maLong;
    }

    @Schema(description = "성과 지표")
    @Data
    @Builder
    @AllArgsConstructor
    public static class MetricsDto {

        @Schema(description = "누적 수익률 (%)", example = "12.50")
        private BigDecimal cumulativeReturn;

        @Schema(description = "최대 낙폭 (%)", example = "5.30")
        private BigDecimal mdd;

        @Schema(description = "승률 (%)", example = "60.00")
        private BigDecimal winRate;

        @Schema(description = "거래 횟수", example = "10")
        private Integer tradeCount;
    }

    @Schema(description = "거래 내역")
    @Data
    @Builder
    @AllArgsConstructor
    public static class TradeDto {

        @Schema(description = "진입 시각")
        private LocalDateTime entryTime;

        @Schema(description = "청산 시각")
        private LocalDateTime exitTime;

        @Schema(description = "진입 가격")
        private BigDecimal entryPrice;

        @Schema(description = "청산 가격")
        private BigDecimal exitPrice;

        @Schema(description = "수익")
        private BigDecimal profit;

        @Schema(description = "수익률 (%)")
        private BigDecimal profitPercent;
    }
}
