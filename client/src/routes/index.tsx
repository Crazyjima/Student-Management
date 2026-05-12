import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AppShell } from '@/components/AppShell';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { LoginPage, RegisterPage } from '@/features/auth';
import { UserDetailPage, UserNewPage, UsersListPage } from '@/features/users';
import { DashboardPlaceholder } from './DashboardPlaceholder';
import { NotFoundPage } from './NotFoundPage';
import {
  redirectIfAuthenticatedLoader,
  requireAuthLoader,
  requireRolesLoader,
} from './loaders';

function FeaturePlaceholder({ name }: { name: string }): ReactElement {
  return (
    <section>
      <h1>{name}</h1>
      <p style={{ color: 'var(--color-fg-muted)' }}>
        Coming in Phase 4. The route is wired and gated; only the UI is missing.
      </p>
    </section>
  );
}

function ForbiddenPage(): ReactElement {
  return (
    <main
      role="alert"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      <div>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-fg-subtle)',
            marginBottom: 'var(--space-2)',
          }}
        >
          403
        </p>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Forbidden</h1>
        <p style={{ color: 'var(--color-fg-muted)' }}>
          Your account doesn’t have access to that page.
        </p>
      </div>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'login',
        loader: redirectIfAuthenticatedLoader,
        element: <LoginPage />,
      },
      {
        path: 'register',
        loader: redirectIfAuthenticatedLoader,
        element: <RegisterPage />,
      },
      {
        loader: requireAuthLoader,
        element: <AppShell />,
        children: [
          { path: 'dashboard', element: <DashboardPlaceholder /> },
          {
            path: 'users',
            loader: requireRolesLoader('ADMIN'),
            children: [
              { index: true, element: <UsersListPage /> },
              { path: 'new', element: <UserNewPage /> },
              { path: ':id', element: <UserDetailPage /> },
            ],
          },
          {
            path: 'teachers',
            loader: requireRolesLoader('ADMIN'),
            element: <FeaturePlaceholder name="Teachers" />,
          },
          {
            path: 'students',
            loader: requireRolesLoader('ADMIN', 'TEACHER'),
            element: <FeaturePlaceholder name="Students" />,
          },
          {
            path: 'classes',
            loader: requireRolesLoader('ADMIN', 'TEACHER'),
            element: <FeaturePlaceholder name="Classes" />,
          },
          {
            path: 'attendance',
            loader: requireRolesLoader('ADMIN', 'TEACHER'),
            element: <FeaturePlaceholder name="Attendance" />,
          },
          { path: 'grades', element: <FeaturePlaceholder name="Grades" /> },
        ],
      },
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
