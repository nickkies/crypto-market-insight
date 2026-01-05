import { create } from 'zustand';

export interface User {
  userId: number;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    sessionStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
