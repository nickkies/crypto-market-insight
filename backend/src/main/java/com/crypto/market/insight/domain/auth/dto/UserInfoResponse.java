package com.crypto.market.insight.domain.auth.dto;

import com.crypto.market.insight.domain.user.model.entity.User;
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

    @Schema(description = "닉네임", example = "nickkies")
    private String nickname;

    @Schema(description = "이메일", example = "user@github.com")
    private String email;

    @Schema(description = "프로필 이미지 URL", example = "https://avatars.githubusercontent.com/u/12345")
    private String profileImage;

    public static UserInfoResponse from(User user) {
        return UserInfoResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .build();
    }
}
