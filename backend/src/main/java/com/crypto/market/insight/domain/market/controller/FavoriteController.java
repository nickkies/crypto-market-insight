package com.crypto.market.insight.domain.market.controller;

import com.crypto.market.insight.domain.market.dto.FavoriteDto;
import com.crypto.market.insight.domain.market.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorite", description = "즐겨찾기 API")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Operation(summary = "즐겨찾기 추가", description = "코인을 즐겨찾기에 추가합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "즐겨찾기 추가 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "409", description = "이미 즐겨찾기에 추가된 코인")
    })
    @PostMapping
    public ResponseEntity<FavoriteDto.Response> addFavorite(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody FavoriteDto.Request request) {
        FavoriteDto.Response response = favoriteService.addFavorite(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "즐겨찾기 삭제", description = "코인을 즐겨찾기에서 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "즐겨찾기 삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "즐겨찾기를 찾을 수 없음")
    })
    @DeleteMapping("/{coinId}")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "코인 ID", example = "bitcoin") @PathVariable String coinId) {
        favoriteService.removeFavorite(userId, coinId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "즐겨찾기 목록 조회", description = "사용자의 즐겨찾기 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping
    public ResponseEntity<List<FavoriteDto.Response>> getFavorites(
            @AuthenticationPrincipal Long userId) {
        List<FavoriteDto.Response> favorites = favoriteService.getFavorites(userId);
        return ResponseEntity.ok(favorites);
    }
}
