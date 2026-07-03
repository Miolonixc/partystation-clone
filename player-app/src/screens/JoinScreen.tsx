import { useState } from 'react';

interface JoinScreenProps {
  onJoin: (roomId: string, playerName: string) => void;
  error: string | null;
  isHost?: boolean;
  onCreateRoom?: (hostName: string) => void;
  loading?: boolean;
}

export function JoinScreen({ onJoin, error, isHost, onCreateRoom, loading }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const urlRoomId = urlParams.get('room');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    if (isHost && onCreateRoom) {
      onCreateRoom(name);
    } else {
      const code = (urlRoomId || roomId).trim();
      if (code) {
        onJoin(code.toUpperCase(), name);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>🎮</span>
        </div>
        <h1 style={styles.title}>PartyStation</h1>
        <p style={styles.subtitle}>Интерактивные игры для вечеринок</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="player-name">Имя игрока</label>
            <input
              id="player-name"
              type="text"
              placeholder="Как вас зовут?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              maxLength={20}
              autoFocus
              disabled={loading}
            />
          </div>

          {!isHost && (
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="room-code">Код комнаты</label>
              <input
                id="room-code"
                type="text"
                placeholder="XXXXXX"
                value={urlRoomId || roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                style={{ ...styles.input, ...styles.codeInput }}
                maxLength={6}
                disabled={!!urlRoomId || loading}
              />
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner}></span>
                Подключение...
              </span>
            ) : isHost ? 'Создать комнату' : 'Войти в комнату'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>или</span>
        </div>

        <p style={styles.hint}>
          {isHost
            ? 'Создайте комнату и пригласите друзей по QR-коду'
            : 'Сканируйте QR-код или введите код комнаты'}
        </p>
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
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 8,
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 32,
    fontSize: 15,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  codeInput: {
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 12,
    textTransform: 'uppercase',
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
    marginTop: 8,
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 12,
    background: 'rgba(255,107,107,0.15)',
    border: '1px solid rgba(255,107,107,0.3)',
    color: '#FF6B6B',
    fontSize: 14,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerText: {
    color: '#666',
    fontSize: 13,
    padding: '0 12px',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    lineHeight: 1.5,
  },
};
