package com.crypto.market.insight.domain.market.service;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import com.crypto.market.insight.domain.market.dto.FavoriteDto;
import com.crypto.market.insight.domain.market.mapper.FavoriteMapper;
import com.crypto.market.insight.domain.market.model.entity.Favorite;
import com.crypto.market.insight.domain.market.repository.FavoriteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final FavoriteMapper favoriteMapper;

    @Transactional
    public FavoriteDto.Response addFavorite(Long userId, FavoriteDto.Request request) {
        if (favoriteRepository.existsByUserIdAndCoinId(userId, request.getCoinId())) {
            throw new BusinessException(ErrorCode.FAVORITE_ALREADY_EXISTS);
        }

        Favorite favorite = favoriteMapper.toEntity(userId, request.getCoinId());
        Favorite saved = favoriteRepository.save(favorite);
        return favoriteMapper.toResponse(saved);
    }

    @Transactional
    public void removeFavorite(Long userId, String coinId) {
        if (!favoriteRepository.existsByUserIdAndCoinId(userId, coinId)) {
            throw new BusinessException(ErrorCode.FAVORITE_NOT_FOUND);
        }

        favoriteRepository.deleteByUserIdAndCoinId(userId, coinId);
    }

    public List<FavoriteDto.Response> getFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(favoriteMapper::toResponse)
                .toList();
    }
}
