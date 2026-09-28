const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const S = (p) => ({ viewBox: '0 0 24 24', width: p.size || 20, height: p.size || 20, ...base, ...p });

export const IconGrid = (p) => (
  <svg {...S(p)}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
);
export const IconEdit = (p) => (
  <svg {...S(p)}><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="M14.5 7 17 9.5" /></svg>
);
export const IconTrash = (p) => (
  <svg {...S(p)}><path d="M4 7h16" /><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" /><path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20L18 7" /><path d="M10 11v6M14 11v6" /></svg>
);
export const IconPlus = (p) => (
  <svg {...S(p)}><path d="M12 4v16M4 12h16" /></svg>
);
export const IconUpload = (p) => (
  <svg {...S(p)}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V16" /></svg>
);
export const IconPalette = (p) => (
  <svg {...S(p)}><path d="M12 3a9 8 0 1 0 0 16c1.4 0 1.9-1 1.4-2.1-.4-.9.2-1.9 1.2-1.9H16a5 4 0 0 0 5-4c0-4.4-4-8-9-8Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="9.5" cy="7" r="1" /><circle cx="14.5" cy="7" r="1" /><circle cx="16.5" cy="11" r="1" /></svg>
);
export const IconLogout = (p) => (
  <svg {...S(p)}><path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const IconClose = (p) => (
  <svg {...S(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconInbox = (p) => (
  <svg {...S(p)}><path d="M3 12h5l2 3h4l2-3h5" /><path d="M5.5 5h13L21 12v6.5A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5V12L5.5 5Z" /></svg>
);
export const IconStaff = (p) => (
  <svg {...S(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 4.5a3.2 3.2 0 0 1 0 6.4" /><path d="M17 14c2.6.5 4.5 2.8 4.5 6" /></svg>
);
export const IconClipboard = (p) => (
  <svg {...S(p)}><rect x="6" y="4" width="12" height="17" rx="1.5" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><path d="M9 11h6M9 15h6" /></svg>
);
export const IconBell = (p) => (
  <svg {...S(p)}><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IconSearch = (p) => (
  <svg {...S(p)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20 15.2 15.2" /></svg>
);
export const IconBadge = (p) => (
  <svg {...S(p)}><circle cx="12" cy="9" r="5" /><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" /></svg>
);
export const IconVideo = (p) => (
  <svg {...S(p)}><rect x="3" y="5.5" width="13" height="13" rx="2" /><path d="M16 10l5-3v10l-5-3" /></svg>
);
export const IconHome = (p) => (
  <svg {...S(p)}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V10" /></svg>
);
export const IconLayers = (p) => (
  <svg {...S(p)}><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M3 13l9 5 9-5" /></svg>
);
