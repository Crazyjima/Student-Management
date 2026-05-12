import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import { registerFormSchema, type RegisterFormValues } from '../schemas';
import { useRegister } from '../hooks/useRegister';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps): ReactElement => {
  const registerMutation = useRegister();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterFormValues>({
      resolver: zodResolver(registerFormSchema),
      defaultValues: {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
      },
      mode: 'onSubmit',
    });

  const onSubmit = handleSubmit((data) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Account created');
        onSuccess();
      },
      onError: (err) => {
        toast.error(errorMessage(err));
      },
    });
  });

  const isPending = registerMutation.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <FormField label="First name" htmlFor="register-firstName" required error={errors.firstName?.message}>
            <Input id="register-firstName" {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="register-lastName" required error={errors.lastName?.message}>
            <Input id="register-lastName" {...register('lastName')} />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="register-email" required error={errors.email?.message}>
          <Input id="register-email" type="email" {...register('email')} />
        </FormField>
        <FormField label="Password" htmlFor="register-password" required error={errors.password?.message}>
          <PasswordInput id="register-password" {...register('password')} />
        </FormField>
        <FormField label="Confirm password" htmlFor="register-confirmPassword" required error={errors.confirmPassword?.message}>
          <PasswordInput id="register-confirmPassword" {...register('confirmPassword')} />
        </FormField>
        <Button type="submit" fullWidth size="lg" isLoading={isPending} loadingText="Creating account…">
          Create account
        </Button>
      </div>
    </form>
  );
};
