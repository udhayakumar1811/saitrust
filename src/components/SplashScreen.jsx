import { useEffect, useState } from 'react';
import logoImg from '../assets/sai-logo.png';
import { SettingsAPI } from '../services/api';
import './SplashScreen.css';

/**
 * Branded splash screen shown once when the app first loads. Fades the
 * logo in with a gold glow, holds briefly, then fades the whole overlay
 * out so the home page underneath is revealed.
 */
export default function SplashScreen({ onDone, minDuration = 1700 }) {
  const [leaving, setLeaving] = useState(false);
  // Uses whatever logo Admin has uploaded (Admin Panel → Logo), same as
  // the Navbar/Footer — falls back to the bundled default otherwise.
  const [customLogo, setCustomLogo] = useState(null);

  useEffect(() => {
    SettingsAPI.getPublic().then((res) => setCustomLogo(res.data?.logoUrl || null));
  }, []);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), minDuration);
    const doneTimer = setTimeout(() => onDone?.(), minDuration + 550);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [minDuration, onDone]);

  return (
    <div className={`splash ${leaving ? 'splash--leaving' : ''}`} role="status" aria-live="polite">
      <div className="splash__glow" />
      <div className="splash__logo-wrap">
        <img src={customLogo || logoImg} alt="" className="splash__logo" />
      </div>
      <div className="splash__name">SAI International</div>
      <div className="splash__sub">Social Service Trust</div>
    </div>
  );
}
