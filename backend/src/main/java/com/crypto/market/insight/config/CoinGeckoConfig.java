package com.crypto.market.insight.config;

import com.crypto.market.insight.domain.market.exception.CoinGeckoApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatusCode;
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
                .defaultStatusHandler(statusCode -> statusCode.value() == 429, (req, res) -> {
                    log.warn("CoinGecko Rate Limit exceeded: {}", req.getURI());
                    throw CoinGeckoApiException.rateLimitExceeded();
                })
                .defaultStatusHandler(HttpStatusCode::is5xxServerError, (req, res) -> {
                    log.error("CoinGecko Server Error: {} {}", res.getStatusCode().value(), req.getURI());
                    throw CoinGeckoApiException.serverError(res.getStatusCode().value());
                })
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
