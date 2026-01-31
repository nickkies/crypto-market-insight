import { useInfiniteQuery } from '@tanstack/react-query';
import { marketService } from '../services';

const PAGE_SIZE = 20;

interface UseCoinsInfiniteOptions {
  keyword?: string;
  category?: string;
}

export const useCoinsInfinite = ({
  keyword,
  category,
}: UseCoinsInfiniteOptions = {}) => {
  return useInfiniteQuery({
    queryKey: ['coins', { keyword, category }],
    queryFn: ({ pageParam = 1 }) =>
      marketService.getCoins({
        page: pageParam,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
        category: category || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.coins.length < PAGE_SIZE) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
};
