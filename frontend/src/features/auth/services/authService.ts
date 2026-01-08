import { client } from '@/features/common/api';
import type { User } from '../stores';

export const authService = {
  async getMe(): Promise<User> {
    const response = await client.get<User>('/api/auth/me');
    return response.data;
  },
};
