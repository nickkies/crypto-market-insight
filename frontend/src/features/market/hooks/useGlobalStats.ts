import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services';

export const useGlobalStats = () => {
  return useQuery({
    queryKey: ['globalStats'],
    queryFn: marketService.getGlobalStats,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
