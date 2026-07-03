import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, Question, RoundResult, GameOverData } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || `http://${window.location.hostname}:3000`;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<RoundResult | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room-update', (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    socket.on('game-start', () => {
      setGameStarted(true);
    });

    socket.on('new-question', (q: Question) => {
      setQuestion(q);
      setResults(null);
      setAnswered(false);
    });

    socket.on('round-results', (r: RoundResult) => {
      setResults(r);
      setQuestion(null);
    });

    socket.on('game-over', (data) => {
      setGameOver(data);
      setQuestion(null);
      setResults(null);
    });

    return () => { socket.disconnect(); };
  }, []);

  const createRoom = useCallback((hostName: string): Promise<{ roomId: string }> => {
    return new Promise((resolve) => {
      socketRef.current?.emit('create-room', { hostName }, resolve);
    });
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string): Promise<{ playerId: string } | { error: string }> => {
    return new Promise((resolve) => {
      socketRef.current?.emit('join-room', { roomId, playerName }, resolve);
    });
  }, []);

  const submitAnswer = useCallback((roomId: string, answer: number, timeSpent: number) => {
    socketRef.current?.emit('submit-answer', { roomId, answer, timeSpent });
  }, []);

  const submitDareVote = useCallback((roomId: string, completed: boolean) => {
    socketRef.current?.emit('submit-dare-vote', { roomId, completed });
  }, []);

  const nextRound = useCallback((roomId: string) => {
    socketRef.current?.emit('next-round', { roomId });
  }, []);

  const startGame = useCallback((roomId: string, settings?: Record<string, unknown>) => {
    socketRef.current?.emit('start-game', { roomId, settings });
  }, []);

  return {
    socket: socketRef.current,
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
  };
}
