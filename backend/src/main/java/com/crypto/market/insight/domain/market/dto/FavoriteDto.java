package com.crypto.market.insight.domain.market.dto;

import com.crypto.market.insight.domain.market.model.entity.Favorite;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

public class FavoriteDto {

    @Schema(description = "즐겨찾기 추가 요청")
    @Getter
    public static class Request {
        @Schema(description = "코인 ID", example = "bitcoin")
        @NotBlank(message = "coinId는 필수입니다")
        private String coinId;
    }

    @Schema(description = "즐겨찾기 응답")
    @Getter
    @Builder
    public static class Response {
        @Schema(description = "즐겨찾기 ID")
        private Long id;

        @Schema(description = "코인 ID", example = "bitcoin")
        private String coinId;

        @Schema(description = "생성 시각")
        private LocalDateTime createdAt;

        public static Response from(Favorite favorite) {
            return Response.builder()
                    .id(favorite.getId())
                    .coinId(favorite.getCoinId())
                    .createdAt(favorite.getCreatedAt())
                    .build();
        }
    }
}
