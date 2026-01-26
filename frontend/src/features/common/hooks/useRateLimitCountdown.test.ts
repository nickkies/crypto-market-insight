import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimitCountdown } from './useRateLimitCountdown';

describe('useRateLimitCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('에러가 없으면 countdown은 0이다', () => {
    const { result } = renderHook(() => useRateLimitCountdown(null));

    expect(result.current.countdown).toBe(0);
    expect(result.current.isRateLimited).toBe(false);
  });

  it('429 에러 시 기본 60초 카운트다운을 시작한다', () => {
    const error = { status: 429 };
    const { result } = renderHook(() => useRateLimitCountdown(error));

    expect(result.current.countdown).toBe(60);
    expect(result.current.isRateLimited).toBe(true);
  });

  it('retryAfterSeconds가 있으면 해당 값으로 카운트다운을 시작한다', () => {
    const error = { status: 429, retryAfterSeconds: 30 };
    const { result } = renderHook(() => useRateLimitCountdown(error));

    expect(result.current.countdown).toBe(30);
    expect(result.current.isRateLimited).toBe(true);
  });

  it('시간이 지나면 카운트다운이 감소한다', () => {
    const error = { status: 429, retryAfterSeconds: 5 };
    const { result } = renderHook(() => useRateLimitCountdown(error));

    expect(result.current.countdown).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.countdown).toBe(4);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.countdown).toBe(2);
  });

  it('카운트다운이 0이 되면 onCountdownEnd 콜백이 호출된다', () => {
    const onCountdownEnd = vi.fn();
    const error = { status: 429, retryAfterSeconds: 2 };

    renderHook(() => useRateLimitCountdown(error, { onCountdownEnd }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onCountdownEnd).toHaveBeenCalledTimes(1);
  });

  it('429가 아닌 에러는 카운트다운을 시작하지 않는다', () => {
    const error = { status: 500 };
    const { result } = renderHook(() => useRateLimitCountdown(error));

    expect(result.current.countdown).toBe(0);
    expect(result.current.isRateLimited).toBe(false);
  });
});
