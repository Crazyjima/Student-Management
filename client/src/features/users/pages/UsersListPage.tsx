import { useState, useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Button } from '@/components/Button';
import { Confirm } from '@/components/Confirm';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { Select } from '@/components/Select';
import { Spinner } from '@/components/Spinner';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import { useDeleteUser, useUsersList } from '../hooks';
import { listUsersQuerySchema, type PublicUser, type RoleName } from '../schemas';
import { UsersTable } from '../components/UsersTable';
import './UsersListPage.css';

const parseQuery = (searchParams: URLSearchParams) => {
  return listUsersQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
    sortOrder: searchParams.get('sortOrder') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    role: searchParams.get('role') ?? undefined,
    isActive: searchParams.get('isActive') ?? undefined,
  });
};

export const UsersListPage = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const current = parseQuery(searchParams);
  const deferredSearch = useDeferredValue(current.search);
  const query = {
    ...current,
    search: deferredSearch,
  };
  const users = useUsersList(query);
  const deleteUser = useDeleteUser();
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const usersData = users.data;

  const updateParams = (patch: Record<string, string | undefined>): void => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    if (!('page' in patch)) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const roleOptions: readonly RoleName[] = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'];

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage staff, students, parents, and administrators from one place."
        actions={
          <Button onClick={() => void navigate('/users/new')}>New user</Button>
        }
      />

      <section className="users-page">
        <div className="users-page__filters">
          <Input
            value={current.search ?? ''}
            onChange={(event) => updateParams({ search: event.target.value })}
            placeholder="Search by name or email"
            aria-label="Search users"
          />
          <Select
            value={current.role ?? ''}
            onChange={(event) => updateParams({ role: event.target.value || undefined })}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
          <Select
            value={current.isActive ?? ''}
            onChange={(event) => updateParams({ isActive: event.target.value || undefined })}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <Select
            value={`${current.sortBy}:${current.sortOrder}`}
            onChange={(event) => {
              const [sortBy, sortOrder] = event.target.value.split(':');
              updateParams({ sortBy, sortOrder });
            }}
            aria-label="Sort users"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="lastLoginAt:desc">Recent login</option>
            <option value="firstName:asc">First name A-Z</option>
            <option value="lastName:asc">Last name A-Z</option>
            <option value="email:asc">Email A-Z</option>
          </Select>
        </div>

        {users.isLoading ? (
          <div className="users-page__loading">
            <Spinner label="Loading users" />
          </div>
        ) : users.isError ? (
          <EmptyState title="Could not load users" description={errorMessage(users.error)} />
        ) : usersData === undefined || usersData.items.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try changing your filters or create the first account for this school."
            action={
              <Button onClick={() => void navigate('/users/new')}>New user</Button>
            }
          />
        ) : (
          <>
            <div className="users-page__summary">
              <span>{usersData.totalCount} total users</span>
              <span>Page {usersData.page} of {usersData.totalPages}</span>
            </div>
            <UsersTable
              users={usersData.items}
              onDelete={(user) => setSelectedUser(user)}
              deletingId={deleteUser.isPending ? deleteUser.variables ?? null : null}
            />
            <div className="users-page__pagination">
              <Button
                variant="secondary"
                disabled={!usersData.hasPrevPage}
                onClick={() => updateParams({ page: String(current.page - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={!usersData.hasNextPage}
                onClick={() => updateParams({ page: String(current.page + 1) })}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </section>

      <Confirm
        open={selectedUser !== null}
        title="Delete user?"
        description={
          selectedUser === null
            ? undefined
            : `This will deactivate ${selectedUser.firstName} ${selectedUser.lastName} and revoke active sessions.`
        }
        confirmLabel="Delete user"
        variant="danger"
        isPending={deleteUser.isPending}
        onCancel={() => setSelectedUser(null)}
        onConfirm={() => {
          if (selectedUser === null) return;
          deleteUser.mutate(selectedUser.id, {
            onSuccess: () => {
              toast.success('User deleted');
              setSelectedUser(null);
            },
            onError: (err) => {
              toast.error(errorMessage(err));
            },
          });
        }}
      />
    </>
  );
};
