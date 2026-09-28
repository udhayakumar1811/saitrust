// Applies a theme preset's colors onto the CSS custom properties defined in
// index.css, so switching the Admin theme (Section 14) re-colors the whole
// public site — not just the admin panel — without a page reload.

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(hexA, hexB, amount) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

export function applyThemePreset(preset) {
  if (!preset || typeof document === 'undefined') return;
  const root = document.documentElement.style;
  const { ink, gold, goldLight, maroon, cream } = preset;

  const goldPale = mix(gold, '#ffffff', 0.75);
  const cream2 = mix(cream, '#000000', 0.03);
  const maroonLight = mix(maroon, '#ffffff', 0.18);
  const maroonDark = mix(maroon, '#000000', 0.25);
  const inkSoft = mix(ink, '#ffffff', 0.08);
  const ink2 = mix(ink, '#ffffff', 0.14);

  root.setProperty('--ink', ink);
  root.setProperty('--ink-soft', inkSoft);
  root.setProperty('--ink-2', ink2);
  root.setProperty('--gold', gold);
  root.setProperty('--gold-light', goldLight);
  root.setProperty('--gold-pale', goldPale);
  root.setProperty('--cream', cream);
  root.setProperty('--cream-2', cream2);
  root.setProperty('--maroon', maroon);
  root.setProperty('--maroon-light', maroonLight);
  root.setProperty('--maroon-dark', maroonDark);
  root.setProperty('--line', `${mix(gold, '#ffffff', 0)}40`);
  root.setProperty('--grad-maroon', `linear-gradient(135deg, ${maroonLight} 0%, ${maroon} 55%, ${maroonDark} 100%)`);
  root.setProperty('--grad-gold', `linear-gradient(135deg, ${goldPale} 0%, ${gold} 48%, ${mix(gold, '#000000', 0.35)} 100%)`);
  root.setProperty('--grad-ink', `linear-gradient(180deg, ${inkSoft} 0%, ${ink} 100%)`);
}
