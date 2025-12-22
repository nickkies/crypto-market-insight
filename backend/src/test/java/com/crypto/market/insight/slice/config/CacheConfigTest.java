package com.crypto.market.insight.slice.config;

import com.crypto.market.insight.config.CacheConfig;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CacheConfigTest {

    @Autowired
    private CacheManager cacheManager;

    @Test
    @DisplayName("CacheManager에 coinMarkets 캐시가 등록되어 있다")
    void cacheManager_hasCoinMarketsCache() {
        assertThat(cacheManager.getCache(CacheConfig.COIN_MARKETS)).isNotNull();
    }

    @Test
    @DisplayName("CacheManager에 ohlc 캐시가 등록되어 있다")
    void cacheManager_hasOhlcCache() {
        assertThat(cacheManager.getCache(CacheConfig.OHLC)).isNotNull();
    }
}
