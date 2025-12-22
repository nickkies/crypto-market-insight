package com.crypto.market.insight.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.github.benmanes.caffeine.cache.Cache;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String COIN_MARKETS = "coinMarkets";
    public static final String OHLC = "ohlc";

    private static final long COIN_MARKETS_TTL_SECONDS = 60;      // 시세: 1분
    private static final long OHLC_TTL_SECONDS = 300;             // OHLC: 5분
    private static final long MAX_SIZE = 1000;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.registerCustomCache(COIN_MARKETS, buildCache(COIN_MARKETS_TTL_SECONDS));
        cacheManager.registerCustomCache(OHLC, buildCache(OHLC_TTL_SECONDS));
        return cacheManager;
    }

    private Cache<Object, Object> buildCache(long ttlSeconds) {
        return Caffeine.newBuilder()
                .maximumSize(MAX_SIZE)
                .expireAfterWrite(ttlSeconds, TimeUnit.SECONDS)
                .recordStats()
                .build();
    }
}
