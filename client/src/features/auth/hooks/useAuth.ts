import { useAuthStore, type AuthStatus } from '@/store/auth-store';
import type { TokenUser } from '../schemas';

interface UseAuthReturn {
  user: TokenUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    accessToken,
  };
};
