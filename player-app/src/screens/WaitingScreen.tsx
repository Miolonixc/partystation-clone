import { useState } from 'react';
import type { Player } from '../types';
import { QRCode } from '../components/QRCode';

interface WaitingScreenProps {
  players: Player[];
  roomId: string;
  isHost?: boolean;
  onStart?: () => void;
}

export function WaitingScreen({ players, roomId, isHost, onStart }: WaitingScreenProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const joinUrl = `${window.location.origin}?room=${roomId}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = roomId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleStart = () => {
    if (starting || !onStart) return;
    setStarting(true);
    onStart();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Ожидание игроков...</h2>

        <div style={styles.qrSection}>
          <div role="img" aria-label="QR-код для входа в комнату">
            <QRCode value={joinUrl} size={180} />
          </div>
        </div>

        <div style={styles.roomCode}>
          <span style={styles.label}>Код комнаты</span>
          <div style={styles.codeRow}>
            <span
              style={styles.code}
              onClick={handleCopyCode}
              onKeyDown={(e) => e.key === 'Enter' && handleCopyCode()}
              role="button"
              tabIndex={0}
              title="Нажмите чтобы скопировать"
            >
              {roomId}
            </span>
            <button
              style={styles.copyBtn}
              onClick={handleCopyCode}
              aria-label="Скопировать код комнаты"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <span style={styles.urlHint}>{joinUrl}</span>
          <button style={styles.copyLinkBtn} onClick={handleCopyLink}>
            {copied ? 'Скопировано!' : 'Копировать ссылку'}
          </button>
        </div>

        <div style={styles.playerList}>
          <span style={styles.playerCount}>Игроки ({players.length}/10)</span>
          {players.length === 0 && (
            <p style={styles.noPlayers}>Сканируйте QR-код или введите код...</p>
          )}
          {players.map((p, i) => (
            <div key={p.id} style={styles.playerItem}>
              <div style={styles.avatar}>{p.name.charAt(0).toUpperCase()}</div>
              <span style={styles.playerName}>{p.name}</span>
              {i === 0 && <span style={styles.hostBadge}>ХОСТ</span>}
            </div>
          ))}
        </div>

        {isHost && players.length > 0 && (
          <button
            style={{
              ...styles.startBtn,
              ...(starting ? styles.startBtnDisabled : {}),
            }}
            onClick={handleStart}
            disabled={starting}
          >
            {starting ? 'Запуск...' : `🎮 Начать игру (${players.length} игроков)`}
          </button>
        )}

        {isHost && players.length === 0 && (
          <p style={styles.hint}>Ждём игроков по QR-коду...</p>
        )}

        {!isHost && (
          <p style={styles.hint}>Хост начнёт игру, когда все будут готовы</p>
        )}
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
    maxWidth: 420,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrSection: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  roomCode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  code: {
    fontSize: 40,
    fontWeight: 900,
    letterSpacing: 8,
    background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    cursor: 'pointer',
  },
  copyBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
  },
  urlHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    wordBreak: 'break-all',
    textAlign: 'center',
  },
  copyLinkBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid rgba(108,99,255,0.5)',
    background: 'rgba(108,99,255,0.1)',
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  playerList: {
    width: '100%',
    marginBottom: 20,
  },
  playerCount: {
    fontSize: 16,
    fontWeight: 600,
    color: '#aaa',
    display: 'block',
    marginBottom: 12,
    textAlign: 'center',
  },
  noPlayers: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    padding: 20,
  },
  playerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 600,
    flex: 1,
  },
  hostBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: 6,
    background: '#FF6B6B',
    color: '#fff',
  },
  startBtn: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #4ECDC4, #44B09E)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  startBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
};
