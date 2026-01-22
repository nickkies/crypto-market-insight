package com.crypto.market.insight.domain.market.mapper;

import com.crypto.market.insight.domain.market.dto.FavoriteDto;
import com.crypto.market.insight.domain.market.model.entity.Favorite;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FavoriteMapper {

    FavoriteDto.Response toResponse(Favorite favorite);

    default Favorite toEntity(Long userId, String coinId) {
        return Favorite.builder()
                .userId(userId)
                .coinId(coinId)
                .build();
    }
}
