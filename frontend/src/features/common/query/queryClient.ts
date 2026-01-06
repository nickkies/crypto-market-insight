import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
      gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
