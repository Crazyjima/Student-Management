import type { ReactElement } from 'react';
import { Badge } from '@/components/Badge';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/features/auth';

export const DashboardPlaceholder = (): ReactElement => {
  const { user } = useAuth();

  const quickLinks = [
    { title: 'Users', description: 'Manage accounts, roles, and profile setup.' },
    { title: 'Students', description: 'Prepare student records, enrollment, and guardians.' },
    { title: 'Teachers', description: 'Track staff assignments and departments.' },
    { title: 'Attendance', description: 'Lay the groundwork for classroom daily tracking.' },
  ];

  return (
    <section style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Dashboard"
        description="A polished starting point for the school management platform."
      />

      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #123a57 0%, #1f5f8b 55%, #f59e0b 100%)',
          color: '#fff',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Badge variant="warning">Admin-ready</Badge>
          {user?.roles.map((role) => (
            <Badge key={role} variant="neutral">
              {role}
            </Badge>
          ))}
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)' }}>
            Welcome back{user === null ? '' : `, ${user.firstName}`}.
          </h2>
          <p style={{ maxWidth: '48rem', opacity: 0.94 }}>
            Authentication, session refresh, and the user administration module are now connected end to end, so this dashboard can grow into the live operational hub for your school.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {quickLinks.map((item) => (
          <article
            key={item.title}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
            }}
          >
            <h3 style={{ marginBottom: 'var(--space-2)' }}>{item.title}</h3>
            <p style={{ color: 'var(--color-fg-muted)' }}>{item.description}</p>
          </article>
        ))}
      </div>

      {user !== null && (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
          }}
        >
          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>User ID</dt>
          <dd><code>{user.id}</code></dd>
          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>Email</dt>
          <dd>{user.email}</dd>
          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>Name</dt>
          <dd>{user.firstName} {user.lastName}</dd>
          <dt style={{ fontWeight: 'var(--font-weight-medium)' }}>Roles</dt>
          <dd>{user.roles.join(', ')}</dd>
        </dl>
      )}
    </section>
  );
};
