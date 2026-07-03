import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, Question, RoundResult, GameState } from '../types';

const SERVER_URL = 'http://localhost:3000';

const initialState: GameState = {
  roomId: null,
  players: [],
  question: null,
  results: null,
  gameOver: null,
  status: 'lobby',
  answered: 0,
  total: 0,
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<GameState>(initialState);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('room-update', (data: { players: Player[]; roomId: string }) => {
      setState(prev => ({ ...prev, players: data.players, roomId: data.roomId }));
    });

    socket.on('game-start', () => {
      setState(prev => ({ ...prev, status: 'playing' }));
    });

    socket.on('new-question', (q: Question) => {
      setState(prev => ({
        ...prev,
        question: q,
        results: null,
        answered: 0,
        total: prev.players.length,
      }));
    });

    socket.on('player-answered', (data: { total: number; answered: number }) => {
      setState(prev => ({ ...prev, answered: data.answered }));
    });

    socket.on('round-results', (r: RoundResult) => {
      setState(prev => ({
        ...prev,
        results: r,
        question: null,
        players: r.leaderboard.map(p => ({ ...p, correct: false })),
      }));
    });

    socket.on('game-over', (data) => {
      setState(prev => ({
        ...prev,
        gameOver: data,
        question: null,
        results: null,
        status: 'finished',
      }));
    });

    return () => { socket.disconnect(); };
  }, []);

  const createRoom = useCallback((hostName: string) => {
    return new Promise<{ roomId: string }>((resolve) => {
      socketRef.current?.emit('create-room', { hostName }, resolve);
    });
  }, []);

  const startGame = useCallback((roomId: string, settings?: Record<string, unknown>) => {
    socketRef.current?.emit('start-game', { roomId, settings });
  }, []);

  const nextRound = useCallback((roomId: string) => {
    socketRef.current?.emit('next-round', { roomId });
  }, []);

  const endGame = useCallback((roomId: string) => {
    socketRef.current?.emit('end-game', { roomId });
  }, []);

  return {
    state,
    createRoom,
    startGame,
    nextRound,
    endGame,
  };
}
