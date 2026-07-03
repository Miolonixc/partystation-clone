import { useState } from 'react';
import { AvatarSelect, AVATARS, AVATAR_COLORS } from '../components/AvatarSelect';

interface JoinScreenProps {
  onJoin: (roomId: string, playerName: string, avatar: number) => void;
  onCreateRoom: (hostName: string, avatar: number) => void;
  error: string | null;
  loading?: boolean;
}

export function JoinScreen({ onJoin, onCreateRoom, error, loading }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [step, setStep] = useState<'name' | 'avatar' | 'room'>('name');

  const urlParams = new URLSearchParams(window.location.search);
  const urlRoomId = urlParams.get('room');

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    if (urlRoomId) {
      setRoomId(urlRoomId);
      setStep('avatar');
    } else {
      setStep('avatar');
    }
  };

  const handleAvatarSubmit = () => {
    if (urlRoomId) {
      onJoin(urlRoomId, name, avatar);
    } else {
      setStep('room');
    }
  };

  const handleCreate = () => {
    onCreateRoom(name, avatar);
  };

  if (step === 'name') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <span style={styles.logo}>🎮</span>
          </div>
          <h1 style={styles.title}>PartyStation</h1>
          <p style={styles.subtitle}>Интерактивные игры для вечеринок</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Как вас зовут?</label>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              maxLength={20}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            />
          </div>

          <button
            style={styles.button}
            onClick={handleNameSubmit}
            disabled={!name.trim() || loading}
          >
            Далее →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'avatar') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Привет, {name}!</h2>

          <AvatarSelect onSelect={setAvatar} selected={avatar} />

          <button style={styles.button} onClick={handleAvatarSubmit}>
            {urlRoomId ? 'Войти в комнату' : 'Далее →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Код комнаты</h2>

        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="XXXXXX"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            style={{ ...styles.input, ...styles.codeInput }}
            maxLength={6}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onJoin(roomId, name, avatar)}
          />
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <button
          style={styles.button}
          onClick={() => onJoin(roomId, name, avatar)}
          disabled={!roomId.trim() || loading}
        >
          Войти в комнату
        </button>

        <div style={styles.divider}><span>или</span></div>

        <button style={styles.secondaryBtn} onClick={handleCreate}>
          Создать новую комнату
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
  },
  card: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  logoContainer: {
    fontSize: 48,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    margin: 0,
  },
  inputGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    borderRadius: 14,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
  },
  codeInput: {
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 12,
    fontWeight: 700,
  },
  button: {
    width: '100%',
    padding: '16px 0',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
    color: '#fff',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
  },
  secondaryBtn: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 14,
    border: '2px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBox: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    background: 'rgba(255,107,107,0.15)',
    border: '1px solid rgba(255,107,107,0.3)',
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#666',
    fontSize: 13,
  },
};
