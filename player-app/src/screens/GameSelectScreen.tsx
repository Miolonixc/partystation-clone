import type { GameType } from '../types';

interface GameSelectProps {
  onSelect: (game: GameType) => void;
  players: number;
}

const GAMES: { type: GameType; name: string; icon: string; desc: string }[] = [
  { type: 'quiz', name: 'Викторина', icon: '🧠', desc: 'Ответьте на вопросы' },
  { type: 'truth_or_dare', name: 'Правда или Действие', icon: '🎭', desc: 'Выполняйте задания' },
  { type: 'who_am_i', name: 'Кто я?', icon: '🔍', desc: 'Угадайте по подсказкам' },
  { type: 'guess_media', name: 'Угадай медиа', icon: '🎵', desc: 'Угадайте название' },
];

export function GameSelectScreen({ onSelect, players }: GameSelectProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Выберите игру</h2>
        <p style={styles.subtitle}>{players} игроков подключено</p>

        <div style={styles.grid}>
          {GAMES.map((game) => (
            <button
              key={game.type}
              style={styles.gameBtn}
              onClick={() => onSelect(game.type)}
            >
              <span style={styles.gameIcon}>{game.icon}</span>
              <span style={styles.gameName}>{game.name}</span>
              <span style={styles.gameDesc}>{game.desc}</span>
            </button>
          ))}
        </div>
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
    maxWidth: 600,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    textAlign: 'center',
    color: '#fff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 32,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  gameBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '28px 20px',
    borderRadius: 20,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#fff',
  },
  gameIcon: {
    fontSize: 40,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 700,
  },
  gameDesc: {
    fontSize: 13,
    color: '#888',
  },
};
