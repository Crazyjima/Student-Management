import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import { createUserFormSchema, type CreateUserFormValues, type RoleName } from '../schemas';
import { useCreateUser } from '../hooks';

interface UserCreateFormProps {
  onSuccess: (id: string) => void;
  onCancel?: () => void;
}

export const UserCreateForm = ({ onSuccess, onCancel }: UserCreateFormProps): ReactElement => {
  const create = useCreateUser();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      isActive: true as boolean,
      roles: ['STUDENT'],
    },
  });

  const onSubmit = handleSubmit((data: CreateUserFormValues) => {
    create.mutate({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isActive: data.isActive,
      roles: data.roles,
    }, {
      onSuccess: (user) => {
        toast.success('User created successfully');
        onSuccess(user.id);
      },
      onError: (err) => {
        toast.error(errorMessage(err));
      },
    });
  });

  const roleOptions: readonly RoleName[] = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'];
  const isPending = create.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
          <FormField label="First name" htmlFor="firstName" required error={errors.firstName?.message}>
            <Input id="firstName" invalid={errors.firstName !== undefined} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" required error={errors.lastName?.message}>
            <Input id="lastName" invalid={errors.lastName !== undefined} {...register('lastName')} />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
          <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" invalid={errors.email !== undefined} {...register('email')} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" invalid={errors.phone !== undefined} {...register('phone')} />
          </FormField>
        </div>

        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <PasswordInput id="password" invalid={errors.password !== undefined} {...register('password')} />
        </FormField>

        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
          }}
        >
          <legend style={{ padding: '0 var(--space-2)', fontWeight: 'var(--font-weight-semibold)' }}>
            Roles
          </legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: 'var(--space-3)' }}>
            {roleOptions.map((role) => (
              <label
                key={role}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <input type="checkbox" value={role} {...register('roles')} />
                <span>{role}</span>
              </label>
            ))}
          </div>
          {errors.roles?.message !== undefined && (
            <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
              {errors.roles.message}
            </p>
          )}
        </fieldset>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input type="checkbox" {...register('isActive')} />
          <span>Activate account immediately</span>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          {onCancel !== undefined && (
            <Button variant="secondary" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" isLoading={isPending} loadingText="Creating user...">
            Create user
          </Button>
        </div>
      </div>
    </form>
  );
};
