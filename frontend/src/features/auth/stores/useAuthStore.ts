import { create } from 'zustand';

export interface User {
  userId: number;
  nickname: string;
  email: string;
  profileImage: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

const TOKEN_KEY = 'token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token && !get().token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
