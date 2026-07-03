export type GameType = 'quiz' | 'truth_or_dare' | 'guess_media' | 'mini_game' | 'who_am_i' | 'draw_guess';
export type GameStatus = 'waiting' | 'lobby' | 'playing' | 'finished';
export type MiniGameType = 'reaction' | 'memory' | 'pattern';

export interface Player {
  id: string;
  name: string;
  score: number;
  avatar: number;
  isHost: boolean;
  achievements: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
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

export interface WhoAmIQuestion {
  id: string;
  clues: string[];
  answer: string;
  options: string[];
  correctIndex: number;
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
  currentGameType?: GameType;
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
  avatar: number;
}

export const ACHIEVEMENTS = {
  FIRST_WIN: { id: 'first_win', name: 'Первая победа', description: 'Выиграйте первую игру', icon: '🏆' },
  PERFECT_ROUND: { id: 'perfect_round', name: 'Идеальный раунд', description: 'Ответьте правильно на все вопросы раунда', icon: '⭐' },
  SPEED_DEMON: { id: 'speed_demon', name: 'Демон скорости', description: 'Ответьте быстрее всех 3 раза подряд', icon: '⚡' },
  SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Бабочка', description: 'Сыграйте 5 игр', icon: '🦋' },
  TRUTH_MASTER: { id: 'truth_master', name: 'Мастер правды', description: 'Выполните 10 заданий "Правда"', icon: '🎤' },
  DARE_DEVIL: { id: 'dare_devil', name: 'Дьявольский', description: 'Выполните 10 заданий "Действие"', icon: '😈' },
  QUIZ_KING: { id: 'quiz_king', name: 'Король викторин', description: 'Наберите 1000 очков в викторине', icon: '👑' },
  COMEBACK: { id: 'comeback', name: 'Возвращение', description: 'Выиграйте после того как были последним', icon: '🔥' },
};
