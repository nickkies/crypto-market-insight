import { describe, it, expect } from 'vitest';
import { ApiError, isApiError } from './ApiError';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError(404, 'NOT_FOUND', '데이터를 찾을 수 없습니다');

      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('데이터를 찾을 수 없습니다');
      expect(error.name).toBe('ApiError');
      expect(error.timestamp).toBeDefined();
    });

    it('should use provided timestamp', () => {
      const timestamp = '2025-01-01T00:00:00';
      const error = new ApiError(500, 'ERROR', 'message', timestamp);

      expect(error.timestamp).toBe(timestamp);
    });
  });

  describe('factory methods', () => {
    it('networkError should create status 0 error', () => {
      const error = ApiError.networkError();

      expect(error.status).toBe(0);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.isNetworkError).toBe(true);
    });

    it('unknownError should create status 500 error', () => {
      const error = ApiError.unknownError();

      expect(error.status).toBe(500);
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.isServerError).toBe(true);
    });

    it('authRequired should create status 401 error', () => {
      const error = ApiError.authRequired();

      expect(error.status).toBe(401);
      expect(error.code).toBe('AUTH_REQUIRED');
      expect(error.isAuthError).toBe(true);
    });

    it('fromResponse should create error from response data', () => {
      const data = {
        code: 'INVALID_PARAMETER',
        message: '잘못된 파라미터입니다',
        timestamp: '2025-01-01T00:00:00',
      };
      const error = ApiError.fromResponse(400, data);

      expect(error.status).toBe(400);
      expect(error.code).toBe('INVALID_PARAMETER');
      expect(error.message).toBe('잘못된 파라미터입니다');
      expect(error.timestamp).toBe('2025-01-01T00:00:00');
    });
  });

  describe('helper getters', () => {
    it('isNetworkError should return true for status 0', () => {
      expect(new ApiError(0, 'ERR', 'msg').isNetworkError).toBe(true);
      expect(new ApiError(500, 'ERR', 'msg').isNetworkError).toBe(false);
    });

    it('isAuthError should return true for status 401', () => {
      expect(new ApiError(401, 'ERR', 'msg').isAuthError).toBe(true);
      expect(new ApiError(403, 'ERR', 'msg').isAuthError).toBe(false);
    });

    it('isForbiddenError should return true for status 403', () => {
      expect(new ApiError(403, 'ERR', 'msg').isForbiddenError).toBe(true);
      expect(new ApiError(401, 'ERR', 'msg').isForbiddenError).toBe(false);
    });

    it('isNotFoundError should return true for status 404', () => {
      expect(new ApiError(404, 'ERR', 'msg').isNotFoundError).toBe(true);
      expect(new ApiError(400, 'ERR', 'msg').isNotFoundError).toBe(false);
    });

    it('isValidationError should return true for status 400 or 422', () => {
      expect(new ApiError(400, 'ERR', 'msg').isValidationError).toBe(true);
      expect(new ApiError(422, 'ERR', 'msg').isValidationError).toBe(true);
      expect(new ApiError(500, 'ERR', 'msg').isValidationError).toBe(false);
    });

    it('isServerError should return true for status >= 500', () => {
      expect(new ApiError(500, 'ERR', 'msg').isServerError).toBe(true);
      expect(new ApiError(502, 'ERR', 'msg').isServerError).toBe(true);
      expect(new ApiError(400, 'ERR', 'msg').isServerError).toBe(false);
    });

    it('isRateLimitError should return true for status 429', () => {
      expect(new ApiError(429, 'ERR', 'msg').isRateLimitError).toBe(true);
      expect(new ApiError(400, 'ERR', 'msg').isRateLimitError).toBe(false);
    });
  });
});

describe('isApiError', () => {
  it('should return true for ApiError instance', () => {
    const error = new ApiError(500, 'ERR', 'msg');
    expect(isApiError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('msg');
    expect(isApiError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError('error')).toBe(false);
    expect(isApiError({ status: 500 })).toBe(false);
  });
});
