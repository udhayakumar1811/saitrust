import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { IconMenu, IconClose, IconChevronDown, IconUser } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

function initials(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const moreRef = useRef(null);
  const avatarRef = useRef(null);
  const { lang, setLanguage, t } = useLanguage();
  const { isAuthenticated, isStaff, user, logout } = useAuth();
  const navigate = useNavigate();

  // Only 4 links stay directly on the bar so the nav never runs out of room
  // — everything else lives in the "More" dropdown, in both languages.
  const primaryLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/batches', label: t('nav.batches') },
  ];
  const moreLinks = [
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/posts', label: t('nav.posts') },
    { to: '/certification', label: t('nav.certification') },
    { to: '/contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close the "More" and avatar dropdowns on an outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const dashboardPath = isStaff ? '/staff/dashboard' : '/dashboard';

  const handleLogout = () => {
    setAvatarOpen(false);
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)} aria-label="SAI International Social Service Trust — Home">
          <Logo size={38} />
        </Link>

        <nav className="navbar__links" aria-label="Primary">
          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}

          <div className="navbar__more" ref={moreRef}>
            <button
              type="button"
              className={`navbar__link navbar__more-btn ${moreOpen ? 'navbar__link--active' : ''}`}
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              {t('nav.more')} <IconChevronDown size={13} />
            </button>
            <div className={`navbar__dropdown ${moreOpen ? 'navbar__dropdown--open' : ''}`}>
              {moreLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) => `navbar__dropdown-link ${isActive ? 'navbar__dropdown-link--active' : ''}`}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="navbar__cta">
          <button type="button" className="lang-switch" aria-label="Switch language" onClick={() => setLanguage(lang === 'en' ? 'ta' : 'en')}>
            <span className={`lang-switch__opt ${lang === 'en' ? 'lang-switch__opt--active' : ''}`}>EN</span>
            <span className={`lang-switch__opt ${lang === 'ta' ? 'lang-switch__opt--active' : ''}`}>தமிழ்</span>
          </button>

          {!isAuthenticated && (
            <Link to="/login" className="navbar__login-btn">{t('nav.login')}</Link>
          )}

          {isAuthenticated && (
            <div className="navbar__more" ref={avatarRef}>
              <button
                type="button"
                className="navbar__avatar-btn"
                onClick={() => setAvatarOpen((v) => !v)}
                aria-expanded={avatarOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <span className="navbar__avatar">
                  {user?.avatar ? <img src={user.avatar} alt="" /> : (initials(user?.name) || <IconUser size={16} />)}
                </span>
                <IconChevronDown size={13} color="var(--text-on-ink-muted)" />
              </button>
              <div className={`navbar__dropdown ${avatarOpen ? 'navbar__dropdown--open' : ''}`}>
                <Link to="/profile" onClick={() => setAvatarOpen(false)} className="navbar__dropdown-link">
                  {t('nav.profile')}
                </Link>
                <Link to={dashboardPath} onClick={() => setAvatarOpen(false)} className="navbar__dropdown-link">
                  {isStaff ? t('nav.staffDashboard') : t('nav.dashboard')}
                </Link>
                <button type="button" onClick={handleLogout} className="navbar__dropdown-link" style={{ width: '100%', textAlign: 'left' }}>
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className="navbar__burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose color="var(--text-on-ink)" /> : <IconMenu color="var(--text-on-ink)" />}
        </button>
      </div>

      <div className={`navbar__mobile ${open ? 'navbar__mobile--open' : ''}`}>
        <nav className="navbar__mobile-links" aria-label="Mobile">
          {[...primaryLinks, ...moreLinks].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}

          <button type="button" className="lang-switch" style={{ margin: '10px 4px' }} onClick={() => setLanguage(lang === 'en' ? 'ta' : 'en')}>
            <span className={`lang-switch__opt ${lang === 'en' ? 'lang-switch__opt--active' : ''}`}>EN</span>
            <span className={`lang-switch__opt ${lang === 'ta' ? 'lang-switch__opt--active' : ''}`}>தமிழ்</span>
          </button>

          {!isAuthenticated && (
            <Link to="/login" onClick={() => setOpen(false)} className="navbar__mobile-link">{t('nav.login')}</Link>
          )}

          {isAuthenticated && (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="navbar__mobile-link">{t('nav.profile')}</Link>
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="navbar__mobile-link">
                {isStaff ? t('nav.staffDashboard') : t('nav.dashboard')}
              </Link>
              <button type="button" className="navbar__mobile-link" style={{ textAlign: 'left' }} onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
