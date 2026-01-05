import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    vi.clearAllMocks();
  });

  describe('setUser', () => {
    it('사용자 정보를 설정하고 인증 상태를 true로 변경한다', () => {
      const user = { userId: 1, email: 'test@example.com' };

      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('null을 설정하면 인증 상태가 false가 된다', () => {
      useAuthStore.setState({
        user: { userId: 1, email: 'test@example.com' },
        isAuthenticated: true,
      });

      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('세션 스토리지에서 토큰을 제거하고 상태를 초기화한다', () => {
      useAuthStore.setState({
        user: { userId: 1, email: 'test@example.com' },
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
