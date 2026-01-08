import { useQuery } from '@tanstack/react-query';
import { backtestService } from '../services';
import { useAuthStore } from '@/features/auth';

export function useMyBacktests() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['myBacktests'],
    queryFn: backtestService.getMyBacktests,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30, // 30분 (실행/삭제 시 invalidate됨)
  });
}
