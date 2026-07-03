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
        <h1 style={styles.logo}>🎮 PartyStation</h1>
        <p style={styles.subtitle}>Присоединяйся к вечеринке!</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="player-name">Имя игрока</label>
            <input
              id="player-name"
              type="text"
              placeholder="Твоё имя"
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
                placeholder="Код комнаты"
                value={urlRoomId || roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                style={{ ...styles.input, ...styles.codeInput }}
                maxLength={6}
                disabled={!!urlRoomId || loading}
              />
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={!name.trim() || loading}
          >
            {loading ? 'Подключение...' : isHost ? 'Создать комнату' : 'Войти'}
          </button>
        </form>
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
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 30,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.2s, opacity 0.2s',
  },
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  button: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'transform 0.2s, opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 14,
  },
};
