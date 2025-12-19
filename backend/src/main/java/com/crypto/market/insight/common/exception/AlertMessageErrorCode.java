package com.crypto.market.insight.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AlertMessageErrorCode {

    // User Input Errors (HTTP 422)
    MEMBER_NOT_FOUND("회원을 찾을 수 없습니다"),
    INVALID_INPUT_VALUE("입력값이 올바르지 않습니다"),
    INVALID_DATE_RANGE("날짜 범위가 올바르지 않습니다"),
    SYMBOL_NOT_SUPPORTED("지원하지 않는 코인 심볼입니다"),
    STRATEGY_ALREADY_EXISTS("이미 존재하는 전략입니다"),
    BACKTEST_PERIOD_TOO_LONG("백테스트 기간이 너무 깁니다");

    private final String message;
}
