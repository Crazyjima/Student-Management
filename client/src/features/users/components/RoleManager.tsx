import { useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import { useAddRole, useRemoveRole } from '../hooks';
import type { DetailedUser, RoleName } from '../schemas';
import './RoleManager.css';

interface RoleManagerProps {
  user: DetailedUser;
}

const ALL_ROLES: readonly RoleName[] = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'];

const roleVariant = (role: RoleName): 'accent' | 'neutral' | 'success' | 'warning' => {
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

export const RoleManager = ({ user }: RoleManagerProps): ReactElement => {
  const addRole = useAddRole();
  const removeRole = useRemoveRole();
  const [nextRole, setNextRole] = useState<RoleName | ''>('');

  const availableRoles = ALL_ROLES.filter((role) => !user.roles.includes(role));

  const handleAdd = (): void => {
    if (nextRole === '') return;
    addRole.mutate(
      { id: user.id, role: nextRole },
      {
        onSuccess: () => {
          toast.success(`Added ${nextRole} role`);
          setNextRole('');
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  };

  const handleRemove = (role: RoleName): void => {
    removeRole.mutate(
      { id: user.id, role },
      {
        onSuccess: () => {
          toast.success(`Removed ${role} role`);
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  };

  return (
    <section className="role-manager">
      <div className="role-manager__header">
        <div>
          <h2 className="role-manager__title">Roles</h2>
          <p className="role-manager__description">Control what this account can access in the system.</p>
        </div>
        <div className="role-manager__controls">
          <select
            className="role-manager__select"
            value={nextRole}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setNextRole(event.target.value as RoleName | '')}
            disabled={availableRoles.length === 0 || addRole.isPending}
          >
            <option value="">Select role</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <Button onClick={handleAdd} disabled={nextRole === '' || availableRoles.length === 0} isLoading={addRole.isPending}>
            Add role
          </Button>
        </div>
      </div>

      <div className="role-manager__list">
        {user.roles.map((role) => (
          <div key={role} className="role-manager__item">
            <Badge variant={roleVariant(role)}>{role}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(role)}
              isLoading={removeRole.isPending && removeRole.variables?.role === role}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
