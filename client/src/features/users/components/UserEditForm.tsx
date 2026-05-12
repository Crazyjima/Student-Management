import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import { editUserFormSchema, type DetailedUser, type EditUserFormValues } from '../schemas';
import { useUpdateUser } from '../hooks';

interface UserEditFormProps {
  user: DetailedUser;
}

export const UserEditForm = ({ user }: UserEditFormProps): ReactElement => {
  const updateUser = useUpdateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      isActive: user.isActive,
    },
  });

  useEffect(() => {
    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      isActive: user.isActive,
    });
  }, [reset, user]);

  const isPending = updateUser.isPending || isSubmitting;

  const onSubmit = handleSubmit((values) => {
    updateUser.mutate(
      {
        id: user.id,
        patch: {
          ...values,
          phone: values.phone === '' ? null : values.phone,
        },
      },
      {
        onSuccess: () => {
          toast.success('User details updated');
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
          <FormField label="First name" htmlFor="edit-first-name" required error={errors.firstName?.message}>
            <Input id="edit-first-name" invalid={errors.firstName !== undefined} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="edit-last-name" required error={errors.lastName?.message}>
            <Input id="edit-last-name" invalid={errors.lastName !== undefined} {...register('lastName')} />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
          <FormField label="Email" htmlFor="edit-email" error={errors.email?.message}>
            <Input id="edit-email" type="email" invalid={errors.email !== undefined} {...register('email')} />
          </FormField>
          <FormField label="Phone" htmlFor="edit-phone" error={errors.phone?.message}>
            <Input id="edit-phone" invalid={errors.phone !== undefined} {...register('phone')} />
          </FormField>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input type="checkbox" {...register('isActive')} />
          <span>Account is active</span>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" disabled={!isDirty} isLoading={isPending} loadingText="Saving...">
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
};
