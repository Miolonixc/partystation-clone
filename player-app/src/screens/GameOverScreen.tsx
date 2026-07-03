import type { Player } from '../types';

interface GameOverScreenProps {
  leaderboard: Player[];
  winner: Player;
  playerId: string;
}

export function GameOverScreen({ leaderboard, winner, playerId }: GameOverScreenProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏆 Игра окончена!</h1>

        {winner && (
          <div style={styles.winnerBox}>
            <div style={styles.winnerAvatar}>
              {winner.playerName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 style={styles.winnerName}>{winner.playerName || 'Игрок'}</h2>
            <p style={styles.winnerScore}>{winner.score} очков</p>
            <p style={styles.winnerLabel}>ПОБЕДИТЕЛЬ</p>
          </div>
        )}

        <h3 style={styles.finalTitle}>Финальная таблица</h3>
        <div style={styles.leaderboard}>
          {leaderboard.map((p, i) => (
            <div key={p.playerId} style={{
              ...styles.leaderItem,
              ...(p.playerId === playerId ? styles.leaderItemMe : {}),
              ...(i === 0 ? styles.leaderItemGold : {}),
            }}>
              <span style={styles.leaderPlace}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              <span style={styles.leaderName}>{p.playerName}</span>
              <span style={styles.leaderScore}>{p.score}</span>
            </div>
          ))}
        </div>

        <p style={styles.hint}>Спасибо за игру! 🎉</p>
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
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 24,
  },
  winnerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
    border: '1px solid rgba(255,215,0,0.3)',
    marginBottom: 24,
  },
  winnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 900,
    color: '#fff',
    marginBottom: 12,
  },
  winnerName: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  winnerScore: {
    fontSize: 20,
    color: '#4ECDC4',
    fontWeight: 700,
  },
  winnerLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 4,
    color: '#FFD700',
    marginTop: 8,
  },
  finalTitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 12,
  },
  leaderboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 24,
  },
  leaderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
  },
  leaderItemMe: {
    background: 'rgba(108,99,255,0.2)',
    border: '1px solid rgba(108,99,255,0.4)',
  },
  leaderItemGold: {
    background: 'rgba(255,215,0,0.1)',
    border: '1px solid rgba(255,215,0,0.3)',
  },
  leaderPlace: {
    width: 30,
    fontSize: 18,
    textAlign: 'center',
  },
  leaderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 500,
  },
  leaderScore: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4ECDC4',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
};
