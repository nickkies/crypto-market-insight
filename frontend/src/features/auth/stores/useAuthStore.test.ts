import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    vi.clearAllMocks();
  });

  describe('setUser', () => {
    it('사용자 정보를 설정하고 인증 상태를 true로 변경한다', () => {
      const user = {
        userId: 1,
        nickname: 'testuser',
        email: 'test@example.com',
        profileImage: 'https://example.com/avatar.png',
      };

      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('null을 설정하면 인증 상태가 false가 된다', () => {
      useAuthStore.setState({
        user: {
          userId: 1,
          nickname: 'testuser',
          email: 'test@example.com',
          profileImage: null,
        },
        token: 'test-token',
        isAuthenticated: true,
      });

      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setToken', () => {
    it('토큰을 저장하고 인증 상태를 true로 변경한다', () => {
      useAuthStore.getState().setToken('new-token');

      expect(sessionStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(useAuthStore.getState().token).toBe('new-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('세션 스토리지에서 토큰을 제거하고 상태를 초기화한다', () => {
      useAuthStore.setState({
        user: {
          userId: 1,
          nickname: 'testuser',
          email: 'test@example.com',
          profileImage: null,
        },
        token: 'test-token',
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('initializeAuth', () => {
    it('세션 스토리지에 토큰이 있으면 인증 상태를 복원한다', () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('stored-token');

      useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().token).toBe('stored-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('세션 스토리지에 토큰이 없으면 상태를 변경하지 않는다', () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue(null);

      useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('이미 토큰이 있으면 다시 초기화하지 않는다', () => {
      useAuthStore.setState({ token: 'existing-token', isAuthenticated: true });
      vi.mocked(sessionStorage.getItem).mockReturnValue('stored-token');

      useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().token).toBe('existing-token');
    });
  });
});
