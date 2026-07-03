import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import { JoinScreen } from './screens/JoinScreen';
import { WaitingScreen } from './screens/WaitingScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { GameOverScreen } from './screens/GameOverScreen';

export default function App() {
  const {
    connected,
    players,
    question,
    results,
    gameOver,
    answered,
    gameStarted,
    setAnswered,
    createRoom,
    joinRoom,
    submitAnswer,
    submitDareVote,
    nextRound,
    startGame,
  } = useSocket();

  const [roomId, setRoomId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<'join' | 'waiting' | 'game' | 'result' | 'gameover'>('join');
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const urlRoomId = urlParams.get('room');

  const handleCreateRoom = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createRoom(name);
      if ('roomId' in res) {
        setRoomId(res.roomId);
        setPlayerId(res.roomId);
        setIsHost(true);
        setScreen('waiting');
      }
    } catch {
      setError('Ошибка создания комнаты');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await joinRoom(id, name);
      if ('error' in res) {
        setError(res.error);
        return;
      }
      if ('playerId' in res) {
        setRoomId(id);
        setPlayerId(res.playerId);
        setScreen('waiting');
      }
    } catch {
      setError('Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback((answer: number, timeSpent: number) => {
    setAnswered(true);
    submitAnswer(roomId, answer, timeSpent);
  }, [roomId, submitAnswer, setAnswered]);

  const handleDareVote = useCallback((completed: boolean) => {
    setAnswered(true);
    submitDareVote(roomId, completed);
  }, [roomId, submitDareVote, setAnswered]);

  const handleNextRound = useCallback(() => {
    nextRound(roomId);
  }, [roomId, nextRound]);

  const handleStartGame = useCallback(() => {
    startGame(roomId, { gameType: 'quiz', totalRounds: 10, roundTime: 15 });
  }, [roomId, startGame]);

  // Screen transitions via useEffect
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
        <p>Подключение к серверу...</p>
        <p style={styles.loadingHint}>Проверьте подключение к сети</p>
      </div>
    );
  }

  if (screen === 'gameover' && gameOver) {
    return (
      <GameOverScreen
        leaderboard={gameOver.leaderboard}
        winner={gameOver.winner}
        playerId={playerId}
      />
    );
  }

  if (screen === 'result' && results) {
    return (
      <ResultScreen results={results} playerId={playerId} />
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

  if (screen === 'waiting') {
    return (
      <WaitingScreen
        players={players}
        roomId={roomId}
        isHost={isHost}
        onStart={handleStartGame}
      />
    );
  }

  return (
    <JoinScreen
      onJoin={handleJoinRoom}
      error={error}
      isHost={!urlRoomId}
      onCreateRoom={handleCreateRoom}
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
  loadingHint: {
    fontSize: 14,
    color: '#666',
  },
};
