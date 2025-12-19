package com.crypto.market.insight.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${app.swagger.server-url:http://localhost:8080}")
    private String serverUrl;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url(serverUrl).description("Current Server"),
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.crypto-market-insight.com").description("Production")
                ));
    }

    private Info apiInfo() {
        return new Info()
                .title("Crypto Market Insight API")
                .description("가상자산 시장 데이터 분석 및 백테스트 API")
                .version("v1.0.0");
    }
}
