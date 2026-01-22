import { useState, useEffect, useRef } from 'react';
import { RATE_LIMIT_COOLDOWN_SECONDS } from '../constants';

interface RateLimitError {
  status?: number;
  retryAfterSeconds?: number | null;
}

interface UseRateLimitCountdownOptions {
  onCountdownEnd?: () => void;
}

export const useRateLimitCountdown = (
  error: RateLimitError | null,
  options?: UseRateLimitCountdownOptions,
) => {
  const [countdown, setCountdown] = useState(0);
  const onCountdownEndRef = useRef(options?.onCountdownEnd);
  onCountdownEndRef.current = options?.onCountdownEnd;

  const isRateLimitError = error?.status === 429;

  useEffect(() => {
    if (isRateLimitError && countdown === 0) {
      const cooldown = error?.retryAfterSeconds ?? RATE_LIMIT_COOLDOWN_SECONDS;
      setCountdown(cooldown);
    }
  }, [isRateLimitError, countdown, error?.retryAfterSeconds]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onCountdownEndRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return {
    countdown,
    isRateLimited: countdown > 0,
  };
};
