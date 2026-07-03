interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  avatar: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface GameOverScreenProps {
  leaderboard: LeaderboardEntry[];
  winner: LeaderboardEntry;
  playerId: string;
  achievements?: Achievement[];
}

const AVATARS = ['👾', '🤖', '🦊', '🐱', '🐶', '🦁', '🐸', '🐧', '🦄', '🐲', '👻', '🎃', '🧙', '🥷', '🏴‍☠️'];
const AVATAR_COLORS = ['#FF6B6B', '#6C63FF', '#4ECDC4', '#FFE66D', '#FF8A5C', '#A8E6CF', '#DDA0DD', '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#82E0AA', '#F8C471', '#F1948A'];

export function GameOverScreen({ leaderboard, winner, playerId, achievements }: GameOverScreenProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏆 Игра окончена!</h1>

        {winner && (
          <div style={styles.winnerBox}>
            <div style={{ ...styles.winnerAvatar, background: AVATAR_COLORS[winner.avatar || 0] }}>
              {AVATARS[winner.avatar || 0] || '?'}
            </div>
            <h2 style={styles.winnerName}>{winner.playerName}</h2>
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
              <div style={{ ...styles.miniAvatar, background: AVATAR_COLORS[p.avatar || 0] }}>
                {AVATARS[p.avatar || 0] || '?'}
              </div>
              <span style={styles.leaderName}>{p.playerName}</span>
              <span style={styles.leaderScore}>{p.score}</span>
            </div>
          ))}
        </div>

        {achievements && achievements.length > 0 && (
          <>
            <h3 style={styles.finalTitle}>Достижения</h3>
            <div style={styles.achievements}>
              {achievements.map((a) => (
                <div key={a.id} style={styles.achievementItem}>
                  <span style={styles.achievementIcon}>{a.icon}</span>
                  <div>
                    <span style={styles.achievementName}>{a.name}</span>
                    <span style={styles.achievementDesc}>{a.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 420,
  },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 24, color: '#fff', margin: '0 0 24px 0' },
  winnerBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24,
    borderRadius: 20, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', marginBottom: 24,
  },
  winnerAvatar: {
    width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 40, marginBottom: 12,
  },
  winnerName: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 },
  winnerScore: { fontSize: 20, color: '#4ECDC4', fontWeight: 700, margin: '4px 0' },
  winnerLabel: { fontSize: 12, fontWeight: 700, letterSpacing: 4, color: '#FFD700', margin: 0 },
  finalTitle: { fontSize: 16, color: '#aaa', marginBottom: 12 },
  leaderboard: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 },
  leaderItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
    borderRadius: 12, background: 'rgba(255,255,255,0.03)',
  },
  leaderItemMe: { background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)' },
  leaderItemGold: { background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' },
  leaderPlace: { width: 30, fontSize: 18, textAlign: 'center' },
  miniAvatar: {
    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
  },
  leaderName: { flex: 1, fontSize: 16, fontWeight: 500, color: '#fff' },
  leaderScore: { fontSize: 16, fontWeight: 700, color: '#4ECDC4' },
  achievements: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  achievementItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
    borderRadius: 10, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
  },
  achievementIcon: { fontSize: 24 },
  achievementName: { fontSize: 14, fontWeight: 600, color: '#fff', display: 'block' },
  achievementDesc: { fontSize: 12, color: '#888', display: 'block' },
  hint: { textAlign: 'center', color: '#666', fontSize: 14 },
};
