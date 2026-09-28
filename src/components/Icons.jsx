const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconScissors = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <circle cx="6" cy="6" r="2.4" /><circle cx="6" cy="18" r="2.4" />
    <path d="M8.5 8.5 20 20M20 4 8.5 15.5" />
  </svg>
);
export const IconNeedle = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M3 21 15 9" /><circle cx="18" cy="6" r="3" /><path d="M17 5l2 2" />
    <path d="M5 19c1 1 3 1 4 0" />
  </svg>
);
export const IconSparkle = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);
export const IconCake = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
    <path d="M4 21h16" /><path d="M8 12V8M12 12V8M16 12V8" />
    <path d="M8 6c0-1 .8-1 .8-2S8 2 8 2M12 6c0-1 .8-1 .8-2S12 2 12 2M16 6c0-1 .8-1 .8-2S16 2 16 2" />
    <path d="M4 17h16" />
  </svg>
);
export const IconPhone = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z" />
  </svg>
);
export const IconWhatsapp = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor" {...p}>
    <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.1-1.34A9.95 9.95 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.06c-1.7 0-3.28-.5-4.6-1.36l-.33-.2-3.03.8.81-2.95-.21-.34a8.03 8.03 0 0 1-1.24-4.29c0-4.46 3.64-8.08 8.12-8.08 4.47 0 8.1 3.62 8.1 8.08 0 4.47-3.63 8.09-8.12 8.09Zm4.44-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.11 3.64.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
  </svg>
);
export const IconMail = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6.5 8 6 8-6" />
  </svg>
);
export const IconPin = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" />
  </svg>
);
export const IconInstagram = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
export const IconFacebook = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M14 9h2.5V6H14c-1.66 0-3 1.34-3 3v2H9v3h2v7h3v-7h2.4l.6-3H14V9.2c0-.11.09-.2.2-.2Z" />
  </svg>
);
export const IconYoutube = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="6" width="18" height="12" rx="4" /><path d="M11 10.5v3l3-1.5-3-1.5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="m4 12.5 5 5L20 6" />
  </svg>
);
export const IconMenu = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);
export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
  </svg>
);
export const IconSeat = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" /><path d="M4 10h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" /><path d="M6 17v3M18 17v3" />
  </svg>
);
export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const IconCertificate = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M7 8h10M7 11h6" />
    <circle cx="12" cy="19" r="2.5" /><path d="m9.8 18.6-1.3 3.4 3-1.3 3 1.3-1.3-3.4" />
  </svg>
);
export const IconStar = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="currentColor" {...p}>
    <path d="M12 2.5 14.9 9l7.1.6-5.4 4.6 1.7 6.9L12 17.7 5.7 21.1l1.7-6.9L2 9.6 9.1 9 12 2.5Z" />
  </svg>
);
export const IconArrow = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconUsers = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
    <circle cx="17" cy="9" r="2.4" /><path d="M15.5 15c2.5.4 4.5 2 4.5 5" />
  </svg>
);
export const IconTarget = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
export const IconHeart = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M12 20.5s-7.5-4.6-9.5-9.4C1.2 7.8 3 5 6.2 5c2 0 3.4 1.1 4 2.1.6-1 2-2.1 4-2.1 3.2 0 5 2.8 3.7 6.1-2 4.8-9.5 9.4-9.5 9.4Z" />
  </svg>
);
export const IconChevronDown = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6" />
  </svg>
);
export const IconCamera = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="14" r="3.4" />
  </svg>
);
export const IconPlay = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="currentColor" {...p} stroke="none">
    <path d="M8 5.5v13l11-6.5-11-6.5z" />
  </svg>
);
export const IconImage = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="M21 16l-5.5-5.5L6 19" />
  </svg>
);
export const IconAward = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <circle cx="12" cy="8" r="5" /><path d="m8.5 12.5-1.5 7 5-2 5 2-1.5-7" />
  </svg>
);
