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
        <div style={styles.header}>
          <h2 style={styles.title}>Ожидание игроков</h2>
          <div style={styles.badge}>{players.length}/10</div>
        </div>

        <a href={joinUrl} target="_blank" rel="noopener noreferrer" style={styles.qrLink}>
          <div style={styles.qrSection}>
            <QRCode value={joinUrl} size={180} />
          </div>
          <span style={styles.qrHint}>Нажмите чтобы открыть</span>
        </a>

        <div style={styles.roomCode}>
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
          {players.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📱</span>
              <span style={styles.emptyText}>Сканируйте QR-код или введите код</span>
            </div>
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
            {starting ? 'Запуск...' : `Начать игру (${players.length})`}
          </button>
        )}

        {isHost && players.length === 0 && (
          <p style={styles.hint}>Ждём игроков...</p>
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
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  badge: {
    fontSize: 14,
    fontWeight: 600,
    padding: '6px 14px',
    borderRadius: 20,
    background: 'rgba(108,99,255,0.3)',
    color: '#a5a0ff',
  },
  qrLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.05)',
    border: '2px dashed rgba(108,99,255,0.4)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  qrSection: {
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
    padding: 8,
  },
  qrHint: {
    fontSize: 12,
    color: '#6C63FF',
    marginTop: 12,
    fontWeight: 500,
  },
  roomCode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
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
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  urlHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    wordBreak: 'break-all',
    textAlign: 'center',
  },
  copyLinkBtn: {
    padding: '10px 20px',
    borderRadius: 12,
    border: 'none',
    background: 'rgba(108,99,255,0.2)',
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  playerList: {
    width: '100%',
    marginBottom: 20,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 32,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  playerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
    transition: 'all 0.2s',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
  },
  playerName: {
    fontSize: 15,
    fontWeight: 500,
    flex: 1,
  },
  hostBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #FF6B6B, #ee5a24)',
    color: '#fff',
  },
  startBtn: {
    width: '100%',
    padding: '16px 0',
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(135deg, #4ECDC4, #44B09E)',
    color: '#fff',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(78,205,196,0.3)',
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
