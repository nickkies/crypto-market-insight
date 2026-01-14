export interface ErrorResponseData {
  code: string;
  message: string;
  timestamp: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly timestamp: string;

  constructor(
    status: number,
    code: string,
    message: string,
    timestamp?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.timestamp = timestamp ?? new Date().toISOString();
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }

  get isForbiddenError(): boolean {
    return this.status === 403;
  }

  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * 사용자 친화적 에러 메시지 반환
   */
  getUserMessage(): string {
    switch (this.status) {
      case 0:
        return '네트워크 연결을 확인해주세요';
      case 400:
        return '잘못된 요청입니다';
      case 401:
        return '로그인이 필요합니다';
      case 403:
        return '접근 권한이 없습니다';
      case 404:
        return '페이지를 찾을 수 없습니다';
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
      case 500:
        return '서버 오류가 발생했습니다';
      default:
        if (this.status >= 500) {
          return '서버 오류가 발생했습니다';
        }
        return this.message || '알 수 없는 오류가 발생했습니다';
    }
  }

  static fromResponse(status: number, data: ErrorResponseData): ApiError {
    return new ApiError(status, data.code, data.message, data.timestamp);
  }

  static networkError(): ApiError {
    return new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해주세요');
  }

  static unknownError(): ApiError {
    return new ApiError(500, 'UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다');
  }

  static authRequired(): ApiError {
    return new ApiError(401, 'AUTH_REQUIRED', '로그인이 필요합니다');
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
