package com.crypto.market.insight.domain.auth.controller;

import com.crypto.market.insight.domain.auth.dto.UserInfoResponse;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "인증 API")
public class AuthController {

    @Operation(
            summary = "현재 사용자 정보 조회",
            description = "JWT 토큰으로 인증된 사용자의 정보를 반환합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(UserInfoResponse.of(userId, ""));
    }

    @Hidden
    @GetMapping("/login/github")
    public void loginWithGitHub(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/github");
    }
}
