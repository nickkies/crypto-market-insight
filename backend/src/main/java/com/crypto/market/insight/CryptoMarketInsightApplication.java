package com.crypto.market.insight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CryptoMarketInsightApplication {

    public static void main(String[] args) {
        SpringApplication.run(CryptoMarketInsightApplication.class, args);
    }
}
