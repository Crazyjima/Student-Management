import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

const isSafeRedirect = (url: string): boolean => {
  if (url.length === 0 || !url.startsWith('/')) {
    return false;
  }
  if (url.startsWith('//') || url.startsWith('/\\')) {
    return false;
  }
  return true;
};

export const LoginPage = (): ReactElement => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleSuccess = (): void => {
    const candidate = params.get('redirect');
    const target = candidate !== null && isSafeRedirect(candidate) ? candidate : '/dashboard';
    void navigate(target, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your school management account"
      footer={
        <>
          New here? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
};
