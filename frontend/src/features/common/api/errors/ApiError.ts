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
