export interface Player {
  id: string;
  name: string;
  score: number;
  correct?: boolean;
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
}

export interface GuessMediaQuestion {
  type: 'guess_media';
  mediaUrl: string;
  mediaType: 'audio' | 'video' | 'image';
  options: string[];
  timeLimit: number;
  round: number;
  total: number;
}

export type Question = QuizQuestion | TruthOrDareTask | GuessMediaQuestion;

export interface RoundResult {
  results: { playerId: string; score: number; correct?: boolean }[];
  leaderboard: { playerId: string; playerName: string; score: number }[];
  round: number;
  total: number;
}

export interface GameState {
  roomId: string | null;
  players: Player[];
  question: Question | null;
  results: RoundResult | null;
  gameOver: { leaderboard: Player[]; winner: Player } | null;
  status: 'lobby' | 'playing' | 'results' | 'finished';
  answered: number;
  total: number;
}

export type Screen = 'lobby' | 'game' | 'results' | 'gameover';
