package com.crypto.market.insight.domain.strategy.dto;

import com.crypto.market.insight.domain.strategy.model.vo.StrategyType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
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

        @Schema(description = "RSI 파라미터")
        @Valid
        @NotNull(message = "파라미터는 필수입니다")
        private RsiParameterDto parameters;

        @Schema(description = "타임프레임", example = "1d")
        @NotBlank(message = "타임프레임은 필수입니다")
        private String timeframe;
    }

    @Schema(description = "RSI 파라미터")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
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

        @Schema(description = "성과 지표")
        private MetricsDto metrics;

        @Schema(description = "거래 내역")
        private List<TradeDto> trades;

        @Schema(description = "생성 시각")
        private LocalDateTime createdAt;
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
