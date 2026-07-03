import { useState } from 'react';

const AVATARS = [
  '👾', '🤖', '🦊', '🐱', '🐶',
  '🦁', '🐸', '🐧', '🦄', '🐲',
  '👻', '🎃', '🧙', '🥷', '🏴‍☠️',
];

const AVATAR_COLORS = [
  '#FF6B6B', '#6C63FF', '#4ECDC4', '#FFE66D', '#FF8A5C',
  '#A8E6CF', '#DDA0DD', '#87CEEB', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#82E0AA', '#F8C471', '#F1948A',
];

interface AvatarSelectProps {
  onSelect: (index: number) => void;
  selected?: number;
}

export function AvatarSelect({ onSelect, selected }: AvatarSelectProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={styles.container}>
      <p style={styles.label}>Выберите аватарку</p>
      <div style={styles.grid}>
        {AVATARS.map((avatar, i) => (
          <button
            key={i}
            style={{
              ...styles.avatarBtn,
              background: AVATAR_COLORS[i],
              ...(selected === i ? styles.selected : {}),
              ...(hovered === i ? styles.hovered : {}),
            }}
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={styles.avatarEmoji}>{avatar}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { AVATARS, AVATAR_COLORS };

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 10,
  },
  avatarBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    border: '3px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  selected: {
    borderColor: '#fff',
    transform: 'scale(1.1)',
    boxShadow: '0 0 16px rgba(255,255,255,0.3)',
  },
  hovered: {
    transform: 'scale(1.05)',
  },
  avatarEmoji: {
    fontSize: 26,
  },
};
