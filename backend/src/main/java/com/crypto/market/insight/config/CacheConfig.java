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
    public static final String INDICATORS = "indicators";
    public static final String GLOBAL_STATS = "globalStats";

    private static final long COIN_MARKETS_TTL_SECONDS = 600;     // 시세: 10분
    private static final long OHLC_TTL_SECONDS = 600;             // OHLC: 10분
    private static final long INDICATORS_TTL_SECONDS = 300;       // 지표: 5분
    private static final long GLOBAL_STATS_TTL_SECONDS = 300;     // 글로벌: 5분
    private static final long MAX_SIZE = 1000;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.registerCustomCache(COIN_MARKETS, buildCache(COIN_MARKETS_TTL_SECONDS));
        cacheManager.registerCustomCache(OHLC, buildCache(OHLC_TTL_SECONDS));
        cacheManager.registerCustomCache(INDICATORS, buildCache(INDICATORS_TTL_SECONDS));
        cacheManager.registerCustomCache(GLOBAL_STATS, buildCache(GLOBAL_STATS_TTL_SECONDS));
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
