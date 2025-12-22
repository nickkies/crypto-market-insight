package com.crypto.market.insight.domain.market.exception;

import com.crypto.market.insight.common.exception.BusinessException;
import com.crypto.market.insight.common.exception.ErrorCode;
import lombok.Getter;

@Getter
public class CoinGeckoApiException extends BusinessException {

    private final int statusCode;

    public CoinGeckoApiException(ErrorCode errorCode, int statusCode) {
        super(errorCode);
        this.statusCode = statusCode;
    }

    public CoinGeckoApiException(ErrorCode errorCode, int statusCode, Throwable cause) {
        super(errorCode, cause);
        this.statusCode = statusCode;
    }

    public static CoinGeckoApiException rateLimitExceeded() {
        return new CoinGeckoApiException(ErrorCode.COINGECKO_RATE_LIMIT, 429);
    }

    public static CoinGeckoApiException timeout(Throwable cause) {
        return new CoinGeckoApiException(ErrorCode.COINGECKO_TIMEOUT, 0, cause);
    }

    public static CoinGeckoApiException serverError(int statusCode) {
        return new CoinGeckoApiException(ErrorCode.COINGECKO_SERVER_ERROR, statusCode);
    }
}
