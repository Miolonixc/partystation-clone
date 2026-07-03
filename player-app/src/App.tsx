import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { JoinScreen } from './screens/JoinScreen';
import { WaitingScreen } from './screens/WaitingScreen';
import { GameSelectScreen } from './screens/GameSelectScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import type { GameType } from './types';

export default function App() {
  const {
    connected, reconnecting, players, question, results, gameOver,
    answered, gameStarted, roomId, playerId, isHost,
    setAnswered, createRoom, joinRoom, startGame,
    submitAnswer, submitDareVote, nextRound,
  } = useSocket();

  const [screen, setScreen] = useState<'join' | 'waiting' | 'game_select' | 'game' | 'result' | 'gameover'>('join');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (name: string, avatar: number) => {
    setLoading(true);
    setError(null);
    try {
      await createRoom(name, avatar);
      setScreen('waiting');
    } catch {
      setError('Ошибка создания комнаты');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (id: string, name: string, avatar: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await joinRoom(id, name, avatar);
      if ('error' in res) { setError(res.error); return; }
      setScreen('waiting');
    } catch {
      setError('Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = useCallback((gameType: GameType) => {
    startGame(gameType);
  }, [startGame]);

  const handleAnswer = useCallback((answer: number, timeSpent: number) => {
    setAnswered(true);
    submitAnswer(answer, timeSpent);
  }, [submitAnswer, setAnswered]);

  const handleDareVote = useCallback((completed: boolean) => {
    setAnswered(true);
    submitDareVote(completed);
  }, [submitDareVote, setAnswered]);

  const handleNextRound = useCallback(() => {
    nextRound();
  }, [nextRound]);

  // Screen transitions
  useEffect(() => {
    if (screen === 'waiting' && gameStarted && question) {
      setScreen('game');
    }
  }, [screen, gameStarted, question]);

  useEffect(() => {
    if (screen === 'game' && results) {
      const t = setTimeout(() => setScreen('result'), 100);
      return () => clearTimeout(t);
    }
  }, [screen, results]);

  useEffect(() => {
    if (gameOver && screen !== 'gameover') {
      const t = setTimeout(() => setScreen('gameover'), 100);
      return () => clearTimeout(t);
    }
  }, [gameOver, screen]);

  useEffect(() => {
    if (screen === 'result' && question) {
      const t = setTimeout(() => setScreen('game'), 100);
      return () => clearTimeout(t);
    }
  }, [screen, question]);

  if (!connected) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>{reconnecting ? 'Переподключение...' : 'Подключение к серверу...'}</p>
      </div>
    );
  }

  if (screen === 'gameover' && gameOver) {
    return <GameOverScreen leaderboard={gameOver.leaderboard} winner={gameOver.winner} playerId={playerId} />;
  }

  if (screen === 'result' && results) {
    return (
      <ResultScreen
        results={results}
        playerId={playerId}
        isHost={isHost}
        onNextRound={handleNextRound}
      />
    );
  }

  if (screen === 'game' && question) {
    return (
      <GameScreen
        question={question}
        onAnswer={handleAnswer}
        onDareVote={handleDareVote}
        answered={answered}
      />
    );
  }

  if (screen === 'game_select' && isHost) {
    return <GameSelectScreen onSelect={handleStartGame} players={players.length} />;
  }

  if (screen === 'waiting') {
    return (
      <WaitingScreen
        players={players}
        roomId={roomId}
        isHost={isHost}
        onStart={() => setScreen('game_select')}
      />
    );
  }

  return (
    <JoinScreen
      onJoin={handleJoinRoom}
      onCreateRoom={handleCreateRoom}
      error={error}
      loading={loading}
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    color: '#fff',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#6C63FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
