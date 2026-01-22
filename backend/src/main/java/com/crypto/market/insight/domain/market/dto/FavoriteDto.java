package com.crypto.market.insight.domain.market.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class FavoriteDto {

    @Schema(description = "즐겨찾기 추가 요청")
    @Data
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public static class Request {
        @Schema(description = "코인 ID", example = "bitcoin")
        @NotBlank(message = "coinId는 필수입니다")
        private String coinId;
    }

    @Schema(description = "즐겨찾기 응답")
    @Data
    @Builder
    @AllArgsConstructor
    public static class Response {
        @Schema(description = "즐겨찾기 ID")
        private Long id;

        @Schema(description = "코인 ID", example = "bitcoin")
        private String coinId;

        @Schema(description = "생성 시각")
        private LocalDateTime createdAt;
    }
}
