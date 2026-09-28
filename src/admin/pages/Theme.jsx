import { AdminStore, THEME_PRESETS, useAdminDb } from '../adminStore';
import { applyThemePreset } from '../applyTheme';
import { IconCheck } from '../../components/Icons';

export default function Theme() {
  useAdminDb();
  const { activePresetId } = AdminStore.getTheme();

  const handleSelect = (preset) => {
    AdminStore.setTheme(preset.id);
    applyThemePreset(preset);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>Theme</h1>
          <p>Choose a preset color palette. Your selection changes the color scheme across the entire public website, not just the admin panel.</p>
        </div>
      </div>

      <div className="admin-theme-grid">
        {THEME_PRESETS.map((p) => {
          const active = p.id === activePresetId;
          return (
            <button
              type="button"
              key={p.id}
              className={`admin-theme-card ${active ? 'is-active' : ''}`}
              onClick={() => handleSelect(p)}
            >
              <div className="admin-theme-swatch">
                <span style={{ background: p.ink }} />
                <span style={{ background: p.gold }} />
                <span style={{ background: p.maroon }} />
                <span style={{ background: p.cream, border: '1px solid #e2ddd0' }} />
              </div>
              <div className="admin-theme-card__name">{p.name}</div>
              {active && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: 'var(--gold)' }}>
                  <IconCheck size={12} /> Active
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
