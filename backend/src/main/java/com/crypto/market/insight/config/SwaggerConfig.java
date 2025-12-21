package com.crypto.market.insight.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String BEARER_AUTH = "Bearer Authentication";

    @Value("${app.swagger.server-url:http://localhost:8080}")
    private String serverUrl;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .externalDocs(new ExternalDocumentation()
                        .description("GitHub 로그인")
                        .url(serverUrl + "/api/auth/login/github"))
                .servers(List.of(
                        new Server().url(serverUrl).description("Current Server"),
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.crypto-market-insight.com").description("Production")
                ))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, bearerSecurityScheme()))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }

    private SecurityScheme bearerSecurityScheme() {
        return new SecurityScheme()
                .name(BEARER_AUTH)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT 토큰을 입력하세요 (Bearer 접두사 없이)");
    }

    private Info apiInfo() {
        return new Info()
                .title("Crypto Market Insight API")
                .description("""
                        # 가상자산 시장 데이터 분석 및 백테스트 API

                        ## 인증 방법

                        1. **GitHub 로그인** 링크 클릭
                        2. GitHub 로그인 후 리다이렉트된 URL에서 token 파라미터 값 복사
                        3. **Authorize** 버튼 클릭 후 토큰 입력
                        4. API 테스트
                        """)
                .version("v1.0.0");
    }
}
