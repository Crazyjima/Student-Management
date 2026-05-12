import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import type { PublicUser } from '../schemas';

interface UsersTableProps {
  users: readonly PublicUser[];
  onDelete: (user: PublicUser) => void;
  deletingId?: string | null;
}

const roleVariant = (role: string): 'accent' | 'neutral' | 'success' | 'warning' => {
  switch (role) {
    case 'ADMIN':
      return 'accent';
    case 'TEACHER':
      return 'success';
    case 'STUDENT':
      return 'warning';
    default:
      return 'neutral';
  }
};

const formatDate = (value: Date | null): string => {
  if (value === null) return 'Never';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

export const UsersTable = ({
  users,
  onDelete,
  deletingId = null,
}: UsersTableProps): ReactElement => {
  return (
    <div className="users-table">
      <table className="users-table__table">
        <thead>
          <tr>
            <th>User</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Last login</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="users-table__identity">
                  <Link to={`/users/${user.id}`} className="users-table__name">
                    {user.firstName} {user.lastName}
                  </Link>
                  <span className="users-table__email">{user.email}</span>
                </div>
              </td>
              <td>
                <div className="users-table__roles">
                  {user.roles.map((role) => (
                    <Badge key={role} variant={roleVariant(role)}>
                      {role}
                    </Badge>
                  ))}
                </div>
              </td>
              <td>
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>{formatDate(user.lastLoginAt)}</td>
              <td>
                <div className="users-table__actions">
                  <Button variant="ghost" size="sm" onClick={() => onDelete(user)} isLoading={deletingId === user.id}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
