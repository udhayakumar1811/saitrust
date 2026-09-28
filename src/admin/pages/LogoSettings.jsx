import { useState, useEffect } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import FileDrop from '../ui/FileDrop';

// Lets Admin replace the default SAI International logo everywhere it
// appears on the public site (Navbar + Footer via components/Logo.jsx, and
// the splash screen). No upload here means the bundled default logo is
// used — removing an uploaded logo falls back to that default again.
export default function LogoSettings() {
  useAdminDb();
  const settings = AdminStore.getFooterSettings();
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || null);
  // getFooterSettings() kicks off a background fetch and returns an empty
  // default on the very first render (before the fetch resolves) — the
  // useState above only captures that first, still-empty value, so once the
  // real settings arrive this local state needs to be synced explicitly or
  // the page keeps showing "no logo" forever, even right after a refresh.
  useEffect(() => {
    setLogoUrl(settings.logoUrl || null);
  }, [settings.logoUrl]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    AdminStore.updateFooterSettings({ logoUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Logo</h1>
          <p>Replaces the default logo shown in the Navbar, Footer and splash screen across the public site. Remove the uploaded image to go back to the default logo.</p>
        </div>
      </div>

      <div className="admin-panel">
        <h3>Logo Image</h3>
        <p className="admin-panel__hint">The default logo is used automatically until you upload one here.</p>
        <FileDrop value={logoUrl} onChange={setLogoUrl} accept="image/*" kind="image" label="Choose logo image" />
      </div>

      {saved && <p className="admin-success-note">Logo updated.</p>}
      <button type="button" className="btn btn-gold" onClick={handleSave}>Save Changes</button>
    </div>
  );
}
