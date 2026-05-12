import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api-error';
import { authService } from '../services/auth.service';
import type { RegisterBody, RegisterFormValues, TokenPair } from '../schemas';

export const useRegister = (): UseMutationResult<TokenPair, ApiError, RegisterFormValues> => {
  return useMutation({
    mutationFn: (form) => {
      const body: RegisterBody = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.phone !== undefined && form.phone !== '' && { phone: form.phone }),
      };
      return authService.register(body);
    },
  });
};
