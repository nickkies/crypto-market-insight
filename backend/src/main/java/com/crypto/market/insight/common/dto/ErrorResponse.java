package com.crypto.market.insight.common.dto;

import com.crypto.market.insight.common.exception.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "공통 에러 응답")
@Data
@Builder
@AllArgsConstructor
public class ErrorResponse {

    @Schema(description = "에러 코드", example = "DATA_NOT_FOUND")
    private String code;

    @Schema(description = "에러 메시지", example = "요청하신 데이터를 찾을 수 없습니다")
    private String message;

    @Schema(description = "발생 시각", example = "2025-12-19T17:00:00")
    private LocalDateTime timestamp;

    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
                .code(errorCode.name())
                .message(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return ErrorResponse.builder()
                .code(errorCode.name())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
