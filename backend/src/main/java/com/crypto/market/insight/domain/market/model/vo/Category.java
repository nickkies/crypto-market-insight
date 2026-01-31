package com.crypto.market.insight.domain.market.model.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Category {

    LAYER_1("layer-1"),
    DEFI("decentralized-finance-defi"),
    MEME("meme-token"),
    GAMING("gaming"),
    AI("artificial-intelligence");

    private final String id;
}
