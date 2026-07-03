export type GameType = 'quiz' | 'truth_or_dare' | 'guess_media' | 'mini_game';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type MiniGameType = 'reaction' | 'memory' | 'pattern';

export interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  mediaUrl?: string;
}

export interface TruthOrDareTask {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  points: number;
}

export interface GuessMediaItem {
  id: string;
  mediaUrl: string;
  mediaType: 'audio' | 'video' | 'image';
  answer: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

export interface MiniGameConfig {
  type: MiniGameType;
  rounds: number;
  timeLimit: number;
}

export interface GameState {
  status: GameStatus;
  currentRound: number;
  totalRounds: number;
  questionIndex: number;
  questionStartTime: number;
  answers: Map<string, Answer>;
  dareVotes: Map<string, boolean>;
  currentTask?: TruthOrDareTask;
}

export interface Answer {
  answer: number;
  timeSpent: number;
}

export interface RoomSettings {
  gameType: GameType;
  maxPlayers: number;
  roundTime: number;
  totalRounds: number;
  miniGameType?: MiniGameType;
}

export interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  settings: RoomSettings;
  state: GameState;
  createdAt: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  correct?: number;
  total?: number;
}
