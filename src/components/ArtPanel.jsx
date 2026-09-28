import { IconScissors, IconNeedle, IconSparkle, IconCake, IconUsers } from './Icons';

const ICONS = {
  scissors: IconScissors,
  needle: IconNeedle,
  sparkle: IconSparkle,
  cake: IconCake,
  users: IconUsers,
};

/**
 * Elegant gold/black illustrated placeholder standing in for real trust
 * photography (hero shot, course photos, gallery images) until the actual
 * asset files are supplied and dropped into /src/assets.
 */
export default function ArtPanel({ icon = 'users', tone = 'ink', ratio = '4 / 3', className = '' }) {
  const Icon = ICONS[icon] || IconUsers;
  const isInk = tone === 'ink';
  return (
    <div
      className={`art-panel ${className}`}
      style={{
        aspectRatio: ratio,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'inherit',
        background: isInk
          ? 'radial-gradient(120% 140% at 20% 15%, #262420 0%, #16140f 55%, #0c0a08 100%)'
          : 'linear-gradient(150deg, #f6e6bd 0%, #eddaa3 55%, #dcc584 100%)',
      }}
    >
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      >
        <circle cx="330" cy="40" r="120" fill="none" stroke={isInk ? '#c99b3f' : '#8f6a1f'} strokeOpacity="0.25" strokeWidth="1.2" />
        <circle cx="330" cy="40" r="95" fill="none" stroke={isInk ? '#c99b3f' : '#8f6a1f'} strokeOpacity="0.18" strokeWidth="1" />
        <circle cx="20" cy="290" r="90" fill="none" stroke={isInk ? '#c99b3f' : '#8f6a1f'} strokeOpacity="0.2" strokeWidth="1" />
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={40 + i * 14} cy={270} r="1.6" fill={isInk ? '#c99b3f' : '#8f6a1f'} opacity="0.35" />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '34%', aspectRatio: '1', minWidth: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isInk ? 'rgba(201,155,63,0.12)' : 'rgba(255,255,255,0.35)',
          border: `1.5px solid ${isInk ? 'rgba(201,155,63,0.4)' : 'rgba(143,106,31,0.35)'}`,
        }}>
          <Icon size={28} color={isInk ? '#e8c876' : '#6b4f16'} style={{ width: '42%', height: '42%' }} />
        </div>
      </div>
    </div>
  );
}
