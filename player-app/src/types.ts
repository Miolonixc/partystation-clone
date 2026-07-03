export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface QuizQuestion {
  type: 'quiz';
  question: string;
  options: string[];
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
  leaderboard: { playerId: string; playerName: string; score: number }[];
  round: number;
  total: number;
}

export interface GameOverData {
  leaderboard: { playerId: string; playerName: string; score: number }[];
  winner: { playerId: string; playerName: string; score: number };
}

export type Screen = 'join' | 'waiting' | 'game' | 'result' | 'gameover';
