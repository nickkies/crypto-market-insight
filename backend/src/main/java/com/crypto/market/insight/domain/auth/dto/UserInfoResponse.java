package com.crypto.market.insight.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Schema(description = "사용자 정보 응답")
@Data
@Builder
@AllArgsConstructor
public class UserInfoResponse {

    @Schema(description = "사용자 ID", example = "1")
    private Long userId;

    @Schema(description = "이메일", example = "user@github.com")
    private String email;

    public static UserInfoResponse of(Long userId, String email) {
        return UserInfoResponse.builder()
                .userId(userId)
                .email(email)
                .build();
    }
}
