import { authClient } from '@/features/common/api';
import type { User } from '../stores';

export const authService = {
  async getMe(): Promise<User> {
    const response = await authClient.get<User>('/api/auth/me');
    return response.data;
  },
};
