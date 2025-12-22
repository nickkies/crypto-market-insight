package com.crypto.market.insight.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "요청 파라미터가 유효하지 않습니다"),
    DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "요청하신 데이터를 찾을 수 없습니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다"),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다"),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다"),

    // Market
    COIN_NOT_FOUND(HttpStatus.NOT_FOUND, "코인 정보를 찾을 수 없습니다"),
    EXTERNAL_API_ERROR(HttpStatus.SERVICE_UNAVAILABLE, "외부 API 호출 중 오류가 발생했습니다"),

    // CoinGecko
    COINGECKO_RATE_LIMIT(HttpStatus.TOO_MANY_REQUESTS, "CoinGecko API 요청 한도를 초과했습니다"),
    COINGECKO_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "CoinGecko API 요청 시간이 초과되었습니다"),
    COINGECKO_SERVER_ERROR(HttpStatus.BAD_GATEWAY, "CoinGecko API 서버 오류가 발생했습니다"),

    // Strategy
    STRATEGY_NOT_FOUND(HttpStatus.NOT_FOUND, "전략을 찾을 수 없습니다"),
    INVALID_STRATEGY_PARAMS(HttpStatus.BAD_REQUEST, "잘못된 전략 파라미터입니다"),

    // Portfolio
    PORTFOLIO_NOT_FOUND(HttpStatus.NOT_FOUND, "포트폴리오를 찾을 수 없습니다"),
    INSUFFICIENT_BALANCE(HttpStatus.BAD_REQUEST, "잔액이 부족합니다");

    private final HttpStatus status;
    private final String message;
}
