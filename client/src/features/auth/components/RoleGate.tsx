import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { RoleName } from '../schemas';

interface RoleGateProps {
  roles: readonly RoleName[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const RoleGate = ({ roles, fallback = null, children }: RoleGateProps): ReactNode => {
  const { user } = useAuth();

  if (user === null) {
    return fallback;
  }
  const allowed = user.roles.some((r) => roles.includes(r));
  return allowed ? children : fallback;
};
