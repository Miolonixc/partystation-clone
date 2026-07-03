import type { RoundResult } from '../types';

interface ResultScreenProps {
  results: RoundResult;
  playerId: string;
}

export function ResultScreen({ results, playerId }: ResultScreenProps) {
  const myResult = results.results.find(r => r.playerId === playerId);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Раунд {results.round}/{results.total}
        </h2>

        {myResult && (
          <div style={{
            ...styles.myResult,
            ...(myResult.correct === true ? styles.correct : {}),
            ...(myResult.correct === false ? styles.wrong : {}),
          }}>
            <span style={styles.myResultText}>
              {myResult.correct === true ? '✅ Правильно!' : myResult.correct === false ? '❌ Неверно' : '⏳ Время вышло'}
            </span>
            <span style={styles.myScore}>+{myResult.score} очков</span>
          </div>
        )}

        <h3 style={styles.leaderboardTitle}>Таблица лидеров</h3>
        <div style={styles.leaderboard}>
          {results.leaderboard.map((p, i) => (
            <div key={p.playerId} style={{
              ...styles.leaderItem,
              ...(p.playerId === playerId ? styles.leaderItemMe : {}),
            }}>
              <span style={styles.leaderPlace}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              <span style={styles.leaderName}>{p.playerName}</span>
              <span style={styles.leaderScore}>{p.score}</span>
            </div>
          ))}
        </div>

        <p style={styles.hint}>Ожидаем следующий раунд...</p>
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
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  myResult: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: 14,
    marginBottom: 24,
    background: 'rgba(255,255,255,0.05)',
  },
  correct: {
    background: 'rgba(78,205,196,0.2)',
    border: '1px solid rgba(78,205,196,0.4)',
  },
  wrong: {
    background: 'rgba(255,107,107,0.2)',
    border: '1px solid rgba(255,107,107,0.4)',
  },
  myResultText: {
    fontSize: 18,
    fontWeight: 600,
  },
  myScore: {
    fontSize: 20,
    fontWeight: 700,
    color: '#4ECDC4',
  },
  leaderboardTitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 12,
  },
  leaderboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
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
