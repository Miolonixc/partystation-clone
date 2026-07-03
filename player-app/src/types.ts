export interface Player {
  id: string;
  name: string;
  score: number;
  avatar: number;
  isHost: boolean;
}

export interface QuizQuestion {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  round: number;
  total: number;
}

export interface TruthOrDareTask {
  type: 'truth_or_dare';
  taskType: 'truth' | 'dare';
  text: string;
  points: number;
  round: number;
  total: number;
  timeLimit: number;
}

export interface GuessMediaQuestion {
  type: 'guess_media';
  mediaUrl: string;
  mediaType: 'audio' | 'video' | 'image';
  options: string[];
  question: string;
  correctIndex: number;
  timeLimit: number;
  round: number;
  total: number;
}

export interface MiniGameConfig {
  type: 'mini_game';
  miniGameType: 'reaction' | 'memory' | 'pattern';
  round: number;
  total: number;
  timeLimit: number;
}

export type Question = QuizQuestion | TruthOrDareTask | GuessMediaQuestion | MiniGameConfig;

export interface RoundResult {
  results: { playerId: string; score: number; correct?: boolean }[];
  leaderboard: { playerId: string; playerName: string; score: number; avatar: number }[];
  round: number;
  total: number;
}

export interface GameOverData {
  leaderboard: { playerId: string; playerName: string; score: number; avatar: number }[];
  winner: { playerId: string; playerName: string; score: number; avatar: number };
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type GameType = 'quiz' | 'truth_or_dare' | 'guess_media' | 'mini_game_reaction' | 'mini_game_memory' | 'mini_game_pattern' | 'who_am_i' | 'draw_guess';

export type Screen = 'join' | 'waiting' | 'game_select' | 'game' | 'result' | 'gameover';

export const AVATARS = [
  '👾', '🤖', '🦊', '🐱', '🐶',
  '🦁', '🐸', '🐧', '🦄', '🐲',
  '👻', '🎃', 'wizard', 'ninja', 'pirate',
];
