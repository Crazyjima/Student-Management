import { NavLink, Outlet } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import { RoleGate, UserMenu } from '@/features/auth';
import type { RoleName } from '@/features/auth';
import './AppShell.css';

interface NavItem {
  to: string;
  label: string;
  roles?: readonly RoleName[];
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Users', roles: ['ADMIN'] },
  { to: '/students', label: 'Students', roles: ['ADMIN', 'TEACHER'] },
  { to: '/teachers', label: 'Teachers', roles: ['ADMIN'] },
  { to: '/classes', label: 'Classes', roles: ['ADMIN', 'TEACHER'] },
  { to: '/attendance', label: 'Attendance', roles: ['ADMIN', 'TEACHER'] },
  { to: '/grades', label: 'Grades' },
];

const NavItemLink = ({ item }: { item: NavItem }): ReactNode => {
  const link = (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `app-shell__nav-link${isActive ? ' app-shell__nav-link--active' : ''}`
      }
    >
      {item.label}
    </NavLink>
  );
  if (item.roles === undefined) {
    return link;
  }
  return <RoleGate roles={item.roles}>{link}</RoleGate>;
};

export const AppShell = (): ReactElement => {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__brand">
          <span className="app-shell__brand-mark" aria-hidden="true">
            SMS
          </span>
          <span className="app-shell__brand-name">School Management</span>
        </div>
        <UserMenu />
      </header>

      <div className="app-shell__body">
        <aside className="app-shell__sidebar" aria-label="Primary navigation">
          <nav>
            <ul className="app-shell__nav">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavItemLink item={item} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
