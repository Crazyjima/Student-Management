import { redirect, type LoaderFunction, type LoaderFunctionArgs } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import type { RoleName } from '@/features/auth';

export const requireAuthLoader: LoaderFunction = ({ request }: LoaderFunctionArgs) => {
  const { status } = useAuthStore.getState();
  if (status !== 'authenticated') {
    const url = new URL(request.url);
    const target = url.pathname + url.search;
    return redirect(`/login?redirect=${encodeURIComponent(target)}`);
  }
  return null;
};

export const requireRolesLoader = (...allowed: readonly RoleName[]): LoaderFunction => ({ request }: LoaderFunctionArgs) => {
  const { status, user } = useAuthStore.getState();
  if (status !== 'authenticated' || user === null) {
    const url = new URL(request.url);
    return redirect(`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }
  const ok = user.roles.some((r) => allowed.includes(r));
  if (!ok) return redirect('/forbidden');
  return null;
};

export const redirectIfAuthenticatedLoader: LoaderFunction = ({ request }: LoaderFunctionArgs) => {
  const { status } = useAuthStore.getState();
  if (status === 'authenticated') {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') ?? '/dashboard';
    return redirect(redirectTo);
  }
  return null;
};
