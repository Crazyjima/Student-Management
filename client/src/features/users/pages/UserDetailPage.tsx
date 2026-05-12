import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Confirm } from '@/components/Confirm';
import { EmptyState } from '@/components/EmptyState';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { PasswordInput } from '@/components/PasswordInput';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/features/auth';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import { useChangePassword, useDeleteUser, useUser } from '../hooks';
import { changePasswordFormSchema, type ChangePasswordFormValues } from '../schemas';
import { ProfileSection } from '../components/ProfileSection';
import { RoleManager } from '../components/RoleManager';
import { UserEditForm } from '../components/UserEditForm';
import './UserDetailPage.css';

export const UserDetailPage = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const userQuery = useUser(id);
  const changePassword = useChangePassword();
  const deleteUser = useDeleteUser();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  if (userQuery.isLoading) {
    return (
      <div className="user-detail__loading">
        <Spinner label="Loading user" />
      </div>
    );
  }

  if (userQuery.isError || userQuery.data === undefined) {
    return (
      <EmptyState
        title="User not available"
        description={userQuery.isError ? errorMessage(userQuery.error) : 'The requested user could not be found.'}
      />
    );
  }

  const user = userQuery.data;
  const isSelf = authUser?.id === user.id;
  const isAdmin = authUser?.roles.includes('ADMIN') ?? false;

  const onPasswordSubmit = form.handleSubmit((values) => {
    changePassword.mutate(
      {
        id: user.id,
        currentPassword: isSelf && !isAdmin ? values.currentPassword : undefined,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success('Password updated');
          form.reset();
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  });

  return (
    <>
      <PageHeader
        eyebrow={
          <Link to="/users" className="user-detail__backlink">
            Back to users
          </Link>
        }
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        actions={
          isAdmin ? (
            <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={isSelf}>
              Delete user
            </Button>
          ) : undefined
        }
      />

      <section className="user-detail">
        <div className="user-detail__hero">
          <div>
            <div className="user-detail__badges">
              <Badge variant={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {user.roles.map((role) => (
                <Badge key={role} variant={role === 'ADMIN' ? 'accent' : role === 'TEACHER' ? 'success' : 'neutral'}>
                  {role}
                </Badge>
              ))}
            </div>
            <dl className="user-detail__meta">
              <div><dt>Phone</dt><dd>{user.phone ?? '-'}</dd></div>
              <div><dt>Created</dt><dd>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(user.createdAt)}</dd></div>
              <div><dt>Last login</dt><dd>{user.lastLoginAt === null ? 'Never' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(user.lastLoginAt)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="user-detail__grid">
          <div className="user-detail__panel">
            <h2 className="user-detail__panel-title">Account details</h2>
            <UserEditForm user={user} />
          </div>

          {isAdmin && (
            <div className="user-detail__panel">
              <RoleManager user={user} />
            </div>
          )}

          <div className="user-detail__panel">
            <h2 className="user-detail__panel-title">Password</h2>
            <form onSubmit={onPasswordSubmit} noValidate className="user-detail__password-form">
              {isSelf && !isAdmin && (
                <FormField label="Current password" htmlFor="current-password" error={form.formState.errors.currentPassword?.message}>
                  <PasswordInput id="current-password" {...form.register('currentPassword')} />
                </FormField>
              )}
              <FormField label="New password" htmlFor="new-password" error={form.formState.errors.newPassword?.message}>
                <PasswordInput id="new-password" {...form.register('newPassword')} />
              </FormField>
              <FormField label="Confirm new password" htmlFor="confirm-password" error={form.formState.errors.confirmNewPassword?.message}>
                <PasswordInput id="confirm-password" {...form.register('confirmNewPassword')} />
              </FormField>
              <div className="user-detail__actions">
                <Button type="submit" isLoading={changePassword.isPending}>
                  Update password
                </Button>
              </div>
            </form>
          </div>
        </div>

        <ProfileSection user={user} />
      </section>

      <Confirm
        open={confirmOpen}
        title="Delete this user?"
        description="This will soft-delete the account and revoke all refresh tokens."
        confirmLabel="Delete user"
        variant="danger"
        isPending={deleteUser.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteUser.mutate(user.id, {
            onSuccess: () => {
              toast.success('User deleted');
              void navigate('/users');
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
