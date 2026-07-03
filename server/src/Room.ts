import { nanoid } from 'nanoid';
import type { Room, RoomSettings, Player, GameState } from './types.js';

const DEFAULT_SETTINGS: RoomSettings = {
  gameType: 'quiz',
  maxPlayers: 10,
  roundTime: 15,
  totalRounds: 10,
};

function createGameState(): GameState {
  return {
    status: 'waiting',
    currentRound: 0,
    totalRounds: 0,
    questionIndex: 0,
    questionStartTime: 0,
    answers: new Map(),
    dareVotes: new Map(),
  };
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(hostId: string, settings?: Partial<RoomSettings>): Room {
    const id = nanoid(6).toUpperCase();
    const room: Room = {
      id,
      hostId,
      players: new Map(),
      settings: { ...DEFAULT_SETTINGS, ...settings },
      state: createGameState(),
      createdAt: Date.now(),
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  deleteRoom(id: string): boolean {
    return this.rooms.delete(id);
  }

  addPlayer(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.players.size >= room.settings.maxPlayers) return false;
    room.players.set(player.id, player);
    return true;
  }

  removePlayer(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.players.delete(playerId);
  }

  getPlayer(roomId: string, playerId: string): Player | undefined {
    const room = this.rooms.get(roomId);
    return room?.players.get(playerId);
  }

  getPlayersList(roomId: string): Player[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.players.values());
  }

  updatePlayerScore(roomId: string, playerId: string, points: number): void {
    const player = this.getPlayer(roomId, playerId);
    if (player) {
      player.score += points;
    }
  }

  getLeaderboard(roomId: string): { playerId: string; playerName: string; score: number }[] {
    return this.getPlayersList(roomId)
      .map(p => ({ playerId: p.id, playerName: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);
  }

  resetScores(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players.forEach(p => { p.score = 0; });
  }

  findRoomByHost(hostId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.hostId === hostId) return room;
    }
    return undefined;
  }

  findRoomByPlayer(playerId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) return room;
    }
    return undefined;
  }

  cleanup(): void {
    const now = Date.now();
    const HOUR = 3600000;
    for (const [id, room] of this.rooms) {
      if (now - room.createdAt > HOUR) {
        this.rooms.delete(id);
      }
    }
  }
}
