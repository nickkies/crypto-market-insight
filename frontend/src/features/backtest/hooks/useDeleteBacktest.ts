import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backtestService } from '../services';

export function useDeleteBacktest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backtestService.deleteBacktest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBacktests'] });
    },
  });
}
