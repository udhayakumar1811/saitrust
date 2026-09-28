import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { subscribeAdminErrors } from './adminStore';
import Logo from '../components/Logo';
import { IconImage, IconAward, IconCamera, IconCertificate, IconCalendar, IconMenu, IconClose as IconCloseThin } from '../components/Icons';
import { IconGrid, IconInbox, IconStaff, IconClipboard, IconBadge, IconPalette, IconLogout, IconLayers } from './AdminIcons';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/admin/hero-banner', label: 'Home Hero Banner', icon: IconImage },
  { to: '/admin/courses', label: 'Courses', icon: IconAward },
  { to: '/admin/batches', label: 'Batches', icon: IconCalendar },
  { to: '/admin/about', label: 'About Us Section', icon: IconLayers },
  { to: '/admin/gallery', label: 'Gallery', icon: IconCamera },
  { to: '/admin/posts', label: 'Posts & Updates', icon: IconImage },
  { to: '/admin/certification', label: 'Certification', icon: IconCertificate },
  { to: '/admin/footer-settings', label: 'Footer & Contact Info', icon: IconClipboard },
  { to: '/admin/contact-submissions', label: 'Contact Submissions', icon: IconInbox },
  { to: '/admin/staff', label: 'Staff Management', icon: IconStaff },
  { to: '/admin/attendance', label: 'Attendance', icon: IconCalendar },
  { to: '/admin/permissions', label: 'Permission Requests', icon: IconClipboard },
  { to: '/admin/students', label: 'Students & Certificates', icon: IconBadge },
  { to: '/admin/theme', label: 'Theme', icon: IconPalette },
  { to: '/admin/logo', label: 'Logo', icon: IconImage },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const errorIdRef = useRef(0);

  useEffect(
    () =>
      subscribeAdminErrors((message) => {
        const id = ++errorIdRef.current;
        setErrors((list) => [...list, { id, message }]);
        setTimeout(() => setErrors((list) => list.filter((e) => e.id !== id)), 8000);
      }),
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Logo size={30} showWordmark={false} />
          <div>
            <strong>SAI Trust</strong>
            <span>Admin Panel</span>
          </div>
          {open && (
            <button className="admin-icon-btn admin-sidebar__closer" onClick={() => setOpen(false)} aria-label="Close menu">
              <IconCloseThin size={18} />
            </button>
          )}
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <a href="/" className="admin-nav-link" target="_blank" rel="noreferrer">
            <IconImage size={17} />
            <span>View Public Site</span>
          </a>
        </div>
      </aside>

      {open && <div className="admin-sidebar-scrim" onClick={() => setOpen(false)} />}

      {errors.length > 0 && (
        <div className="admin-error-toasts">
          {errors.map((e) => (
            <div key={e.id} className="admin-error-toast">
              <span>{e.message}</span>
              <button
                type="button"
                className="admin-error-toast__close"
                onClick={() => setErrors((list) => list.filter((x) => x.id !== e.id))}
                aria-label="Dismiss"
              >
                <IconCloseThin size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          {!open && (
            <button className="admin-icon-btn admin-topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
              <IconMenu size={20} />
            </button>
          )}
          <div className="admin-topbar__title">Admin Panel</div>
          <div className="admin-topbar__user">
            <span className="admin-topbar__avatar">{(admin?.name || 'A').charAt(0)}</span>
            <span className="admin-topbar__name">{admin?.name}</span>
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={handleLogout}>
              <IconLogout size={15} style={{ marginRight: 6, verticalAlign: '-3px' }} /> Logout
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
