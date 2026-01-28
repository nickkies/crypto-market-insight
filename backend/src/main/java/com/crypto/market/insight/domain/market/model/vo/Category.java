package com.crypto.market.insight.domain.market.model.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Category {

    LAYER_1("layer-1", "Layer 1"),
    DEFI("decentralized-finance-defi", "DeFi"),
    MEME("meme-token", "Meme"),
    GAMING("gaming", "Gaming"),
    AI("artificial-intelligence", "AI");

    private final String id;
    private final String displayName;

    public static Category fromId(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        for (Category category : values()) {
            if (category.id.equals(id)) {
                return category;
            }
        }
        return null;
    }
}
