import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, Question, RoundResult, GameOverData, GameType } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || `http://${window.location.hostname}:3000`;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<RoundResult | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 50,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setReconnecting(false);
    });
    socket.on('disconnect', () => {
      setConnected(false);
      setReconnecting(true);
    });
    socket.on('reconnect', () => {
      setConnected(true);
      setReconnecting(false);
    });

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

    socket.on('game-over', (data: GameOverData) => {
      setGameOver(data);
      setQuestion(null);
      setResults(null);
    });

    socket.on('host-change', (data: { hostId: string }) => {
      if (data.hostId === socket.id) {
        setIsHost(true);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  const createRoom = useCallback((hostName: string, avatar: number, joinAsPlayer: boolean = true): Promise<{ roomId: string }> => {
    return new Promise((resolve) => {
      socketRef.current?.emit('create-room', { hostName }, (res: { roomId: string }) => {
        setRoomId(res.roomId);
        setPlayerId(socketRef.current?.id || '');
        setIsHost(true);
        if (joinAsPlayer) {
          socketRef.current?.emit('join-room', { roomId: res.roomId, playerName: hostName, avatar }, (joinRes: any) => {
            if (joinRes.playerId) {
              setPlayerId(joinRes.playerId);
            }
          });
        }
        resolve(res);
      });
    });
  }, []);

  const joinRoom = useCallback((id: string, name: string, avatar: number): Promise<{ playerId: string } | { error: string }> => {
    return new Promise((resolve) => {
      socketRef.current?.emit('join-room', { roomId: id, playerName: name, avatar }, (res: any) => {
        if (res.error) { resolve(res); return; }
        setRoomId(id);
        setPlayerId(res.playerId);
        setIsHost(res.isHost || false);
        resolve(res);
      });
    });
  }, []);

  const startGame = useCallback((gameType: GameType, totalRounds?: number, roundTime?: number) => {
    socketRef.current?.emit('start-game', { roomId, gameType, totalRounds: totalRounds || 10, roundTime: roundTime || 15 });
  }, [roomId]);

  const submitAnswer = useCallback((answer: number, timeSpent: number) => {
    socketRef.current?.emit('submit-answer', { roomId, answer, timeSpent });
  }, [roomId]);

  const submitDareVote = useCallback((completed: boolean) => {
    socketRef.current?.emit('submit-dare-vote', { roomId, completed });
  }, [roomId]);

  const nextRound = useCallback(() => {
    socketRef.current?.emit('next-round', { roomId });
  }, [roomId]);

  const setAvatar = useCallback((avatar: number) => {
    socketRef.current?.emit('set-avatar', { roomId, avatar });
  }, [roomId]);

  return {
    socket: socketRef.current,
    connected,
    reconnecting,
    players,
    question,
    results,
    gameOver,
    answered,
    gameStarted,
    roomId,
    playerId,
    isHost,
    selectedGame,
    setSelectedGame,
    setAnswered,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    submitDareVote,
    nextRound,
    setAvatar,
  };
}
