import type { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastViewport } from '@/components/ToastViewport';
import { AuthBootstrap } from '@/features/auth';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes';

// Provider order (outside-in):
//   1. ErrorBoundary       - catches anything that escapes everything below
//   2. QueryClientProvider - TanStack Query state available everywhere
//   3. AuthBootstrap       - resolves session before router renders
//   4. RouterProvider      - owns the route tree + loaders
//   5. ToastViewport       - portal-rendered, sibling of router; reads toast store
export const App = (): ReactElement => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
        <ToastViewport />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
