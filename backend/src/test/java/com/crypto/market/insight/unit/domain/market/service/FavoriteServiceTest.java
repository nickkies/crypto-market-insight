package com.crypto.market.insight.unit.domain.market.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.dto.FavoriteDto;
import com.crypto.market.insight.domain.market.mapper.FavoriteMapper;
import com.crypto.market.insight.domain.market.model.entity.Favorite;
import com.crypto.market.insight.domain.market.repository.FavoriteRepository;
import com.crypto.market.insight.domain.market.service.FavoriteService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private FavoriteMapper favoriteMapper;

    @InjectMocks
    private FavoriteService favoriteService;

    private Favorite createFavorite(Long id, Long userId, String coinId) {
        Favorite favorite = Favorite.builder()
                .userId(userId)
                .coinId(coinId)
                .build();
        ReflectionTestUtils.setField(favorite, "id", id);
        ReflectionTestUtils.setField(favorite, "createdAt", LocalDateTime.now());
        return favorite;
    }

    private FavoriteDto.Request createRequest(String coinId) {
        try {
            java.lang.reflect.Constructor<FavoriteDto.Request> constructor =
                    FavoriteDto.Request.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            FavoriteDto.Request request = constructor.newInstance();
            ReflectionTestUtils.setField(request, "coinId", coinId);
            return request;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create FavoriteDto.Request", e);
        }
    }

    @Nested
    @DisplayName("addFavorite")
    class AddFavorite {

        @Test
        @DisplayName("즐겨찾기를 추가한다")
        void addsFavorite() {
            // given
            Long userId = 1L;
            FavoriteDto.Request request = createRequest("bitcoin");
            Favorite savedFavorite = createFavorite(1L, userId, "bitcoin");
            FavoriteDto.Response expectedResponse = FavoriteDto.Response.builder()
                    .id(1L)
                    .coinId("bitcoin")
                    .createdAt(savedFavorite.getCreatedAt())
                    .build();

            when(favoriteRepository.existsByUserIdAndCoinId(userId, "bitcoin"))
                    .thenReturn(false);
            when(favoriteMapper.toEntity(userId, "bitcoin"))
                    .thenReturn(savedFavorite);
            when(favoriteRepository.save(any(Favorite.class)))
                    .thenReturn(savedFavorite);
            when(favoriteMapper.toResponse(savedFavorite))
                    .thenReturn(expectedResponse);

            // when
            FavoriteDto.Response response = favoriteService.addFavorite(userId, request);

            // then
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getCoinId()).isEqualTo("bitcoin");
            verify(favoriteRepository).save(any(Favorite.class));
        }

        @Test
        @DisplayName("이미 존재하는 즐겨찾기는 예외가 발생한다")
        void throwsExceptionWhenAlreadyExists() {
            // given
            Long userId = 1L;
            FavoriteDto.Request request = createRequest("bitcoin");

            when(favoriteRepository.existsByUserIdAndCoinId(userId, "bitcoin"))
                    .thenReturn(true);

            // when & then
            assertThatThrownBy(() -> favoriteService.addFavorite(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException e = (BusinessException) ex;
                        assertThat(e.getErrorCode()).isEqualTo(ErrorCode.FAVORITE_ALREADY_EXISTS);
                    });
        }
    }

    @Nested
    @DisplayName("removeFavorite")
    class RemoveFavorite {

        @Test
        @DisplayName("즐겨찾기를 삭제한다")
        void removesFavorite() {
            // given
            Long userId = 1L;
            String coinId = "bitcoin";

            when(favoriteRepository.existsByUserIdAndCoinId(userId, coinId))
                    .thenReturn(true);

            // when
            favoriteService.removeFavorite(userId, coinId);

            // then
            verify(favoriteRepository).deleteByUserIdAndCoinId(userId, coinId);
        }

        @Test
        @DisplayName("존재하지 않는 즐겨찾기 삭제 시 예외가 발생한다")
        void throwsExceptionWhenNotFound() {
            // given
            Long userId = 1L;
            String coinId = "bitcoin";

            when(favoriteRepository.existsByUserIdAndCoinId(userId, coinId))
                    .thenReturn(false);

            // when & then
            assertThatThrownBy(() -> favoriteService.removeFavorite(userId, coinId))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException e = (BusinessException) ex;
                        assertThat(e.getErrorCode()).isEqualTo(ErrorCode.FAVORITE_NOT_FOUND);
                    });
        }
    }

    @Nested
    @DisplayName("getFavorites")
    class GetFavorites {

        @Test
        @DisplayName("사용자의 즐겨찾기 목록을 조회한다")
        void returnsFavorites() {
            // given
            Long userId = 1L;
            Favorite favorite1 = createFavorite(1L, userId, "bitcoin");
            Favorite favorite2 = createFavorite(2L, userId, "ethereum");
            List<Favorite> favorites = List.of(favorite1, favorite2);

            FavoriteDto.Response response1 = FavoriteDto.Response.builder()
                    .id(1L).coinId("bitcoin").createdAt(favorite1.getCreatedAt()).build();
            FavoriteDto.Response response2 = FavoriteDto.Response.builder()
                    .id(2L).coinId("ethereum").createdAt(favorite2.getCreatedAt()).build();

            when(favoriteRepository.findByUserId(userId))
                    .thenReturn(favorites);
            when(favoriteMapper.toResponse(favorite1)).thenReturn(response1);
            when(favoriteMapper.toResponse(favorite2)).thenReturn(response2);

            // when
            List<FavoriteDto.Response> result = favoriteService.getFavorites(userId);

            // then
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getCoinId()).isEqualTo("bitcoin");
            assertThat(result.get(1).getCoinId()).isEqualTo("ethereum");
        }

        @Test
        @DisplayName("즐겨찾기가 없으면 빈 목록을 반환한다")
        void returnsEmptyListWhenNoFavorites() {
            // given
            Long userId = 1L;

            when(favoriteRepository.findByUserId(userId))
                    .thenReturn(List.of());

            // when
            List<FavoriteDto.Response> result = favoriteService.getFavorites(userId);

            // then
            assertThat(result).isEmpty();
        }
    }
}
