package com.crypto.market.insight.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Slf4j
@Configuration
public class CoinGeckoConfig {

    @Bean
    public RestClient coinGeckoRestClient(
            @Value("${app.coingecko.base-url}") String baseUrl,
            @Value("${app.coingecko.connect-timeout}") int connectTimeout,
            @Value("${app.coingecko.read-timeout}") int readTimeout
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);

        RestClient restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .requestInterceptor(loggingInterceptor())
                .build();

        log.info("CoinGeckoRestClient initialized: baseUrl={}, connectTimeout={}ms, readTimeout={}ms",
                baseUrl, connectTimeout, readTimeout);

        return restClient;
    }

    private ClientHttpRequestInterceptor loggingInterceptor() {
        return (request, body, execution) -> {
            log.info("CoinGecko Request: {} {}", request.getMethod(), request.getURI());
            var response = execution.execute(request, body);
            log.info("CoinGecko Response: {} {}", response.getStatusCode().value(), request.getURI().getPath());
            return response;
        };
    }
}
