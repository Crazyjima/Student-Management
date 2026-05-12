import { create } from 'zustand';
import type { TokenUser } from '@/features/auth/schemas';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: TokenUser | null;
  accessToken: string | null;
  setSession: (user: TokenUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => {
    set({ status: 'authenticated', user, accessToken });
  },
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearSession: () => {
    set({ status: 'unauthenticated', user: null, accessToken: null });
  },
  setStatus: (status) => {
    set({ status });
  },
}));
