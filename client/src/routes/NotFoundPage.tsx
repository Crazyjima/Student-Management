import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = (): ReactElement => {
  return (
    <main role="alert" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 'var(--space-8)', textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-fg-subtle)', marginBottom: 'var(--space-2)' }}>404</p>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Page not found</h1>
        <p style={{ color: 'var(--color-fg-muted)', marginBottom: 'var(--space-6)' }}>The page you’re looking for doesn’t exist or has been moved.</p>
        <Link to="/" style={{ display: 'inline-block', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-accent-fg)', fontWeight: 'var(--font-weight-medium)' }}>
          Back to home
        </Link>
      </div>
    </main>
  );
};
