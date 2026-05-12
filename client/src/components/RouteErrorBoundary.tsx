import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ApiError, isApiError } from '@/lib/api-error';

interface NormalizedError {
  title: string;
  message: string;
  status: number | null;
  requestId: string | undefined;
}

const normalize = (error: unknown): NormalizedError => {
  if (isApiError(error)) {
    return {
      title: `Error ${String(error.statusCode)}`,
      message: error.message,
      status: error.statusCode,
      requestId: error.requestId,
    };
  }
  if (isRouteErrorResponse(error)) {
    return {
      title: `Error ${String(error.status)}`,
      message: error.statusText,
      status: error.status,
      requestId: undefined,
    };
  }
  if (error instanceof Error) {
    return {
      title: 'Something went wrong',
      message: error.message,
      status: null,
      requestId: undefined,
    };
  }
  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred',
    status: null,
    requestId: undefined,
  };
};

export const RouteErrorBoundary = (): ReactElement => {
  const error: unknown = useRouteError();
  const normalized = normalize(error);

  return (
    <main role="alert">
      <h1>{normalized.title}</h1>
      <p>{normalized.message}</p>
      {normalized.requestId !== undefined && (
        <p>
          Request ID: <code>{normalized.requestId}</code>
        </p>
      )}
      <Link to="/">Back to home</Link>
    </main>
  );
};

export { ApiError };
