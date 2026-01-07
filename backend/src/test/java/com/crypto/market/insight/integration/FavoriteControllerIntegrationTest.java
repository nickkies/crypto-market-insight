package com.crypto.market.insight.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.crypto.market.insight.domain.market.model.entity.Favorite;
import com.crypto.market.insight.domain.market.repository.FavoriteRepository;
import com.crypto.market.insight.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class FavoriteControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final Long TEST_USER_ID = 1L;
    private String validToken;

    @BeforeEach
    void setUp() {
        favoriteRepository.deleteAll();
        validToken = jwtTokenProvider.createToken(TEST_USER_ID, "test@github.com");
    }

    @Nested
    @DisplayName("POST /api/favorites")
    class AddFavorite {

        @Test
        @DisplayName("즐겨찾기 추가 성공")
        void success() throws Exception {
            String requestBody = objectMapper.writeValueAsString(Map.of("coinId", "bitcoin"));

            mockMvc.perform(post("/api/favorites")
                            .header("Authorization", "Bearer " + validToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.coinId").value("bitcoin"))
                    .andExpect(jsonPath("$.id").exists());

            assertThat(favoriteRepository.existsByUserIdAndCoinId(TEST_USER_ID, "bitcoin")).isTrue();
        }

        @Test
        @DisplayName("중복 즐겨찾기 추가 시 409 에러")
        void duplicate_returns409() throws Exception {
            favoriteRepository.save(Favorite.builder()
                    .userId(TEST_USER_ID)
                    .coinId("bitcoin")
                    .build());

            String requestBody = objectMapper.writeValueAsString(Map.of("coinId", "bitcoin"));

            mockMvc.perform(post("/api/favorites")
                            .header("Authorization", "Bearer " + validToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("FAVORITE_ALREADY_EXISTS"));
        }

        @Test
        @DisplayName("인증 없이 요청하면 401 에러")
        void noAuth_returns401() throws Exception {
            String requestBody = objectMapper.writeValueAsString(Map.of("coinId", "bitcoin"));

            mockMvc.perform(post("/api/favorites")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("DELETE /api/favorites/{coinId}")
    class RemoveFavorite {

        @Test
        @DisplayName("즐겨찾기 삭제 성공")
        void success() throws Exception {
            favoriteRepository.save(Favorite.builder()
                    .userId(TEST_USER_ID)
                    .coinId("bitcoin")
                    .build());

            mockMvc.perform(delete("/api/favorites/bitcoin")
                            .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isNoContent());

            assertThat(favoriteRepository.existsByUserIdAndCoinId(TEST_USER_ID, "bitcoin")).isFalse();
        }

        @Test
        @DisplayName("존재하지 않는 즐겨찾기 삭제 시 404 에러")
        void notFound_returns404() throws Exception {
            mockMvc.perform(delete("/api/favorites/bitcoin")
                            .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("FAVORITE_NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("GET /api/favorites")
    class GetFavorites {

        @Test
        @DisplayName("즐겨찾기 목록 조회 성공")
        void success() throws Exception {
            favoriteRepository.save(Favorite.builder().userId(TEST_USER_ID).coinId("bitcoin").build());
            favoriteRepository.save(Favorite.builder().userId(TEST_USER_ID).coinId("ethereum").build());

            mockMvc.perform(get("/api/favorites")
                            .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].coinId").exists())
                    .andExpect(jsonPath("$[1].coinId").exists());
        }

        @Test
        @DisplayName("즐겨찾기가 없으면 빈 배열 반환")
        void empty_returnsEmptyArray() throws Exception {
            mockMvc.perform(get("/api/favorites")
                            .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("다른 사용자의 즐겨찾기는 조회되지 않음")
        void otherUser_notVisible() throws Exception {
            favoriteRepository.save(Favorite.builder().userId(999L).coinId("bitcoin").build());

            mockMvc.perform(get("/api/favorites")
                            .header("Authorization", "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }
}
