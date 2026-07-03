import type { Room, RoomSettings, GameType } from './types.js';
import { getRandomQuestions } from './games/Quiz.js';
import { getRandomTask } from './games/TruthOrDare.js';
import { getRandomMediaItems } from './games/GuessMedia.js';
import { getRandomWhoAmI } from './games/WhoAmI.js';

export class GameEngine {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  startGame(room: Room, settings: RoomSettings): void {
    room.settings = settings;
    room.state.status = 'playing';
    room.state.currentRound = 1;
    room.state.totalRounds = settings.totalRounds;
    room.state.questionIndex = 0;
    room.state.currentGameType = settings.gameType;
    room.state.answers.clear();
    room.state.dareVotes.clear();
  }

  getCurrentQuestion(room: Room): unknown {
    switch (room.state.currentGameType || room.settings.gameType) {
      case 'quiz':
        return this.getQuizQuestion(room);
      case 'truth_or_dare':
        return this.getTruthOrDareTask(room);
      case 'guess_media':
        return this.getGuessMediaItem(room);
      case 'who_am_i':
        return this.getWhoAmIQuestion(room);
      case 'mini_game':
        return { type: room.settings.miniGameType || 'reaction', round: room.state.currentRound, total: room.state.totalRounds };
      default:
        return this.getQuizQuestion(room);
    }
  }

  private getQuizQuestion(room: Room) {
    const questions = getRandomQuestions(room.settings.totalRounds);
    if (room.state.questionIndex >= questions.length) return null;
    const q = questions[room.state.questionIndex];
    return {
      type: 'quiz' as const,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      timeLimit: room.settings.roundTime,
      round: room.state.currentRound,
      total: room.state.totalRounds,
    };
  }

  private getTruthOrDareTask(room: Room) {
    const type = Math.random() > 0.5 ? 'truth' : 'dare';
    const task = getRandomTask(type);
    room.state.currentTask = task;
    return {
      type: 'truth_or_dare' as const,
      taskType: task.type,
      text: task.text,
      points: task.points,
      round: room.state.currentRound,
      total: room.state.totalRounds,
      timeLimit: room.settings.roundTime,
    };
  }

  private getGuessMediaItem(room: Room) {
    const items = getRandomMediaItems(room.settings.totalRounds);
    if (room.state.questionIndex >= items.length) return null;
    const item = items[room.state.questionIndex];
    return {
      type: 'guess_media' as const,
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      question: item.answer,
      options: item.options,
      correctIndex: item.correctIndex,
      timeLimit: room.settings.roundTime,
      round: room.state.currentRound,
      total: room.state.totalRounds,
    };
  }

  private getWhoAmIQuestion(room: Room) {
    const questions = getRandomWhoAmI(room.settings.totalRounds);
    if (room.state.questionIndex >= questions.length) return null;
    const q = questions[room.state.questionIndex];
    return {
      type: 'who_am_i' as const,
      clues: q.clues,
      answer: q.answer,
      options: q.options,
      correctIndex: q.correctIndex,
      timeLimit: room.settings.roundTime,
      round: room.state.currentRound,
      total: room.state.totalRounds,
    };
  }

  submitAnswer(room: Room, playerId: string, answer: number, timeSpent: number): void {
    room.state.answers.set(playerId, { answer, timeSpent });
  }

  submitDareVote(room: Room, playerId: string, completed: boolean): void {
    room.state.dareVotes.set(playerId, completed);
  }

  isAllAnswered(room: Room): boolean {
    return room.state.answers.size >= room.players.size;
  }

  isAllVoted(room: Room): boolean {
    return room.state.dareVotes.size >= room.players.size;
  }

  calculateResults(room: Room): { playerId: string; score: number; correct: boolean }[] {
    const gameType = room.state.currentGameType || room.settings.gameType;

    if (gameType === 'truth_or_dare') {
      return this.calculateDareResults(room);
    }

    const results: { playerId: string; score: number; correct: boolean }[] = [];
    let correctIndex = 0;

    if (gameType === 'quiz') {
      const questions = getRandomQuestions(room.settings.totalRounds);
      const q = questions[room.state.questionIndex - 1];
      if (!q) return [];
      correctIndex = q.correctIndex;
    } else if (gameType === 'who_am_i') {
      const questions = getRandomWhoAmI(room.settings.totalRounds);
      const q = questions[room.state.questionIndex - 1];
      if (!q) return [];
      correctIndex = q.correctIndex;
    } else if (gameType === 'guess_media') {
      const items = getRandomMediaItems(room.settings.totalRounds);
      const item = items[room.state.questionIndex - 1];
      if (!item) return [];
      correctIndex = item.correctIndex;
    }

    room.state.answers.forEach((answer, playerId) => {
      const correct = answer.answer === correctIndex;
      const timeBonus = Math.max(0, Math.round((1 - answer.timeSpent / (room.settings.roundTime * 1000)) * 50));
      const score = correct ? 100 + timeBonus : 0;
      results.push({ playerId, score, correct });

      const player = room.players.get(playerId);
      if (player) {
        player.score += score;
      }
    });

    return results;
  }

  calculateDareResults(room: Room): { playerId: string; score: number; correct: boolean }[] {
    const task = room.state.currentTask;
    if (!task) return [];

    const results: { playerId: string; score: number; correct: boolean }[] = [];

    room.state.dareVotes.forEach((completed, playerId) => {
      results.push({ playerId, score: completed ? task.points : 0, correct: completed });
      if (completed) {
        const player = room.players.get(playerId);
        if (player) {
          player.score += task.points;
        }
      }
    });

    return results;
  }

  startRoundTimer(room: Room, onTimeout: () => void): void {
    this.clearTimer(room.id);
    const timer = setTimeout(() => {
      onTimeout();
    }, room.settings.roundTime * 1000);
    this.timers.set(room.id, timer);
  }

  clearTimer(roomId: string): void {
    const timer = this.timers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(roomId);
    }
  }

  nextRound(room: Room): boolean {
    if (room.state.currentRound >= room.state.totalRounds) {
      room.state.status = 'finished';
      return false;
    }
    room.state.currentRound++;
    room.state.questionIndex++;
    room.state.answers.clear();
    room.state.dareVotes.clear();
    room.state.currentTask = undefined;
    return true;
  }

  endGame(room: Room): void {
    room.state.status = 'finished';
    this.clearTimer(room.id);
  }

  getLeaderboard(room: Room) {
    return Array.from(room.players.values())
      .map(p => ({ playerId: p.id, playerName: p.name, score: p.score, avatar: p.avatar }))
      .sort((a, b) => b.score - a.score);
  }
}
