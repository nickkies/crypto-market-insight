import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores';
import { authService } from '../services';

export const useUser = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const user = await authService.getMe();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
    meta: {
      onError: () => {
        logout();
      },
    },
  });
};
