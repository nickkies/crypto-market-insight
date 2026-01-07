package com.crypto.market.insight.domain.strategy.controller;

import com.crypto.market.insight.common.ratelimit.RateLimiter;
import com.crypto.market.insight.domain.strategy.dto.BacktestDto;
import com.crypto.market.insight.domain.strategy.service.BacktestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/backtests")
@Tag(name = "Backtest", description = "백테스트 API")
public class BacktestController {

    private final BacktestService backtestService;
    private final RateLimiter rateLimiter;

    @Operation(
            summary = "백테스트 실행",
            description = """
                    RSI 전략 기반 백테스트를 실행합니다.

                    **Rate Limit:**
                    - 익명 사용자: 분당 5회
                    - 인증 사용자: 분당 10회
                    - 전체 시스템: 분당 100회
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "백테스트 실행 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
            @ApiResponse(responseCode = "429", description = "Rate Limit 초과")
    })
    @PostMapping
    public ResponseEntity<BacktestDto.Response> runBacktest(
            @Valid @RequestBody BacktestDto.Request request,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest httpRequest
    ) {
        // Rate Limit 체크
        String key = getClientKey(principal, httpRequest);
        boolean authenticated = principal != null;
        rateLimiter.checkLimit(key, authenticated);

        // 사용자 ID 추출
        Long userId = getUserId(principal);

        // 백테스트 실행
        BacktestDto.Response response = backtestService.runBacktest(request, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "백테스트 결과 조회", description = "저장된 백테스트 결과를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "백테스트 결과를 찾을 수 없음")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BacktestDto.Response> getBacktest(
            @Parameter(description = "백테스트 ID") @PathVariable Long id
    ) {
        BacktestDto.Response response = backtestService.getBacktest(id);
        return ResponseEntity.ok(response);
    }

    private String getClientKey(OAuth2User principal, HttpServletRequest request) {
        if (principal != null) {
            // 인증된 사용자는 userId로 식별
            Object id = principal.getAttribute("id");
            return "user:" + (id != null ? id.toString() : "unknown");
        }
        // 익명 사용자는 IP로 식별
        return "ip:" + getClientIp(request);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private Long getUserId(OAuth2User principal) {
        if (principal == null) {
            return null;
        }
        Object id = principal.getAttribute("id");
        if (id instanceof Number) {
            return ((Number) id).longValue();
        }
        return null;
    }
}
