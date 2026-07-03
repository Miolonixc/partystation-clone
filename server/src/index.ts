import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { RoomManager } from './Room.js';
import { GameEngine } from './GameEngine.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const rooms = new RoomManager();
const engine = new GameEngine();

app.get('/health', (_, res) => {
  res.json({ status: 'ok', rooms: rooms.getLeaderboard.length });
});

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on('create-room', (data: { hostName: string }, callback) => {
    const room = rooms.createRoom(socket.id, data);
    socket.join(room.id);
    callback({ roomId: room.id, playerId: socket.id });
    console.log(`[room] ${room.id} created by ${data.hostName}`);
  });

  socket.on('join-room', (data: { roomId: string; playerName: string }, callback) => {
    const room = rooms.getRoom(data.roomId);
    if (!room) {
      callback({ error: 'Комната не найдена' });
      return;
    }
    if (room.players.size >= room.settings.maxPlayers) {
      callback({ error: 'Комната заполнена' });
      return;
    }

    const player = {
      id: socket.id,
      name: data.playerName,
      score: 0,
    };

    rooms.addPlayer(data.roomId, player);
    socket.join(data.roomId);

    callback({ playerId: socket.id, roomId: data.roomId });
    io.to(data.roomId).emit('room-update', {
      players: rooms.getPlayersList(data.roomId),
      roomId: data.roomId,
    });
    console.log(`[join] ${data.playerName} -> ${data.roomId}`);
  });

  socket.on('start-game', (data: { roomId: string; settings?: Record<string, unknown> }) => {
    const room = rooms.getRoom(data.roomId);
    if (!room || room.hostId !== socket.id) return;

    engine.startGame(room, { ...room.settings, ...data.settings } as any);
    io.to(data.roomId).emit('game-start', { gameType: room.settings.gameType });

    sendNextQuestion(room);
  });

  socket.on('submit-answer', (data: { roomId: string; answer: number; timeSpent: number }) => {
    const room = rooms.getRoom(data.roomId);
    if (!room) return;

    engine.submitAnswer(room, socket.id, data.answer, data.timeSpent);

    io.to(data.roomId).emit('player-answered', {
      playerId: socket.id,
      total: room.players.size,
      answered: room.state.answers.size,
    });

    if (engine.isAllAnswered(room)) {
      processRoundResult(room);
    }
  });

  socket.on('submit-dare-vote', (data: { roomId: string; completed: boolean }) => {
    const room = rooms.getRoom(data.roomId);
    if (!room) return;

    engine.submitDareVote(room, socket.id, data.completed);

    io.to(data.roomId).emit('player-voted', {
      playerId: socket.id,
      total: room.players.size,
      voted: room.state.dareVotes.size,
    });

    if (engine.isAllVoted(room)) {
      processDareResult(room);
    }
  });

  socket.on('next-round', (data: { roomId: string }) => {
    const room = rooms.getRoom(data.roomId);
    if (!room || room.hostId !== socket.id) return;

    const hasMore = engine.nextRound(room);
    if (hasMore) {
      sendNextQuestion(room);
    } else {
      io.to(data.roomId).emit('game-over', {
        leaderboard: engine.getLeaderboard(room),
        winner: engine.getLeaderboard(room)[0],
      });
    }
  });

  socket.on('end-game', (data: { roomId: string }) => {
    const room = rooms.getRoom(data.roomId);
    if (!room || room.hostId !== socket.id) return;

    engine.endGame(room);
    io.to(data.roomId).emit('game-over', {
      leaderboard: engine.getLeaderboard(room),
      winner: engine.getLeaderboard(room)[0],
    });
  });

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);

    const room = rooms.findRoomByPlayer(socket.id);
    if (room) {
      rooms.removePlayer(room.id, socket.id);
      io.to(room.id).emit('room-update', {
        players: rooms.getPlayersList(room.id),
        roomId: room.id,
      });
    }

    const hostRoom = rooms.findRoomByHost(socket.id);
    if (hostRoom) {
      io.to(hostRoom.id).emit('host-disconnected');
      rooms.deleteRoom(hostRoom.id);
    }
  });
});

function sendNextQuestion(room: any): void {
  const question = engine.getCurrentQuestion(room);
  if (!question) {
    room.state.status = 'finished';
    io.to(room.id).emit('game-over', {
      leaderboard: engine.getLeaderboard(room),
      winner: engine.getLeaderboard(room)[0],
    });
    return;
  }

  room.state.questionStartTime = Date.now();
  io.to(room.id).emit('new-question', question);

  engine.startRoundTimer(room, () => {
    processRoundResult(room);
  });
}

function processRoundResult(room: any): void {
  engine.clearTimer(room.id);

  if (room.settings.gameType === 'quiz' || room.settings.gameType === 'guess_media') {
    const results = engine.calculateQuizResults(room);
    io.to(room.id).emit('round-results', {
      results,
      leaderboard: engine.getLeaderboard(room),
      round: room.state.currentRound,
      total: room.state.totalRounds,
    });
  } else if (room.settings.gameType === 'truth_or_dare') {
    const results = engine.calculateDareResults(room);
    io.to(room.id).emit('round-results', {
      results,
      leaderboard: engine.getLeaderboard(room),
      round: room.state.currentRound,
      total: room.state.totalRounds,
    });
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 PartyStation Server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
