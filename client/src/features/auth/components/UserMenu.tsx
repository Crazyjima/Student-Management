import type { ReactElement } from 'react';
import { useLogout } from '../hooks/useLogout';
import { useAuth } from '../hooks/useAuth';
import './UserMenu.css';

export const UserMenu = (): ReactElement | null => {
  const { user } = useAuth();
  const logout = useLogout();

  if (user === null) {
    return null;
  }

  return (
    <div className="user-menu">
      <span>{user.firstName}</span>
      <button
        type="button"
        onClick={() => {
          logout.mutate();
        }}
      >
        Sign out
      </button>
    </div>
  );
};
