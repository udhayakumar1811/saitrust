import { useEffect, useState } from 'react';
import logoImg from '../assets/sai-logo.png';
import { SettingsAPI } from '../services/api';

/**
 * Official SAI International Social Service Trust logo (gold medallion on
 * deep burgundy, provided by the trust) paired with a tight, single-line
 * wordmark — sized to sit neatly in the navbar without wrapping awkwardly.
 * Falls back to the bundled default logo until/unless Admin uploads a
 * replacement (Admin Panel → Logo).
 */
export default function Logo({ variant = 'light', size = 44, showWordmark = true }) {
  const onDark = variant === 'light';
  const [customLogo, setCustomLogo] = useState(null);

  useEffect(() => {
    SettingsAPI.getPublic().then((res) => setCustomLogo(res.data?.logoUrl || null));
  }, []);

  return (
    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <img
        src={customLogo || logoImg}
        alt="SAI International Social Service Trust"
        width={size}
        height={size}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
      {showWordmark && (
        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            color: onDark ? 'var(--text-on-ink)' : 'var(--text-dark)', letterSpacing: '0.005em',
            whiteSpace: 'nowrap',
          }}>
            SAI International
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9.5, letterSpacing: '0.12em',
            color: 'var(--gold)', textTransform: 'uppercase', marginTop: 3, whiteSpace: 'nowrap',
          }}>
            Social Service Trust
          </div>
        </div>
      )}
    </div>
  );
}
