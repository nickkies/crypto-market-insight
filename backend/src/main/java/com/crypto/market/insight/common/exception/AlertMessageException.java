package com.crypto.market.insight.common.exception;

import lombok.Getter;

@Getter
public class AlertMessageException extends RuntimeException {

    private final AlertMessageErrorCode errorCode;

    public AlertMessageException(AlertMessageErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AlertMessageException(AlertMessageErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
