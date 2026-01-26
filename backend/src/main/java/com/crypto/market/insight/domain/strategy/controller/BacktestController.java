package com.crypto.market.insight.domain.strategy.controller;

import com.crypto.market.insight.common.ratelimit.RateLimiter;
import com.crypto.market.insight.domain.strategy.dto.BacktestDto;
import com.crypto.market.insight.domain.strategy.service.BacktestFacadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    private final BacktestFacadeService backtestFacadeService;
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
            HttpServletRequest httpRequest
    ) {
        // 인증 정보 추출 (JWT 또는 OAuth2 모두 지원)
        Long userId = extractUserId();

        // Rate Limit 체크
        String key = getClientKey(userId, httpRequest);
        boolean authenticated = userId != null;
        rateLimiter.checkLimit(key, authenticated);

        // 백테스트 실행
        BacktestDto.Response response = backtestFacadeService.runBacktest(request, userId);
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
        BacktestDto.Response response = backtestFacadeService.getBacktest(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 백테스트 목록 조회", description = "로그인한 사용자의 백테스트 결과 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping
    public ResponseEntity<List<BacktestDto.Response>> getMyBacktests(
            @AuthenticationPrincipal Long userId
    ) {
        List<BacktestDto.Response> responses = backtestFacadeService.getBacktestsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "백테스트 결과 삭제", description = "백테스트 결과를 삭제합니다. 본인의 결과만 삭제 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
            @ApiResponse(responseCode = "404", description = "백테스트 결과를 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBacktest(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "백테스트 ID") @PathVariable Long id
    ) {
        backtestFacadeService.deleteBacktest(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        // JWT 인증: principal이 Long (userId)
        if (principal instanceof Long) {
            return (Long) principal;
        }

        // OAuth2 인증: principal이 OAuth2User
        if (principal instanceof OAuth2User oAuth2User) {
            Object id = oAuth2User.getAttribute("id");
            if (id instanceof Number) {
                return ((Number) id).longValue();
            }
        }

        return null;
    }

    private String getClientKey(Long userId, HttpServletRequest request) {
        if (userId != null) {
            return "user:" + userId;
        }
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
}
