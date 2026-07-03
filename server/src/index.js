const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const rooms = new Map();

const ACHIEVEMENTS = {
  FIRST_WIN: { id: 'first_win', name: 'Первая победа', description: 'Выиграйте первую игру', icon: '🏆' },
  PERFECT_ROUND: { id: 'perfect_round', name: 'Идеальный раунд', description: 'Все ответы правильные', icon: '⭐' },
  SPEED_DEMON: { id: 'speed_demon', name: 'Демон скорости', description: 'Самый быстрый ответ 3 раза', icon: '⚡' },
  QUIZ_KING: { id: 'quiz_king', name: 'Король викторин', description: '1000+ очков в викторине', icon: '👑' },
  DARE_DEVIL: { id: 'dare_devil', name: 'Дьявольский', description: '10 выполненных действий', icon: '😈' },
};

function createRoom(hostId) {
  const id = nanoid(6).toUpperCase();
  const room = {
    id,
    hostId,
    players: new Map(),
    settings: { gameType: 'quiz', maxPlayers: 10, roundTime: 15, totalRounds: 10 },
    state: { status: 'lobby', currentRound: 0, totalRounds: 0, questionIndex: 0, questionStartTime: 0, answers: new Map(), dareVotes: new Map() },
    createdAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

function getPlayers(room) {
  return Array.from(room.players.values());
}

function getLeaderboard(room) {
  return getPlayers(room)
    .map(p => ({ playerId: p.id, playerName: p.name, score: p.score, avatar: p.avatar }))
    .sort((a, b) => b.score - a.score);
}

const timers = new Map();

function clearTimer(roomId) {
  const t = timers.get(roomId);
  if (t) { clearTimeout(t); timers.delete(roomId); }
}

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on('create-room', (data, callback) => {
    const room = createRoom(socket.id);
    socket.join(room.id);
    callback({ roomId: room.id });
    console.log(`[room] ${room.id} created`);
  });

  socket.on('join-room', (data, callback) => {
    const room = rooms.get(data.roomId);
    if (!room) { callback({ error: 'Комната не найдена' }); return; }
    if (room.players.size >= room.settings.maxPlayers) { callback({ error: 'Комната заполнена' }); return; }
    if (room.state.status === 'playing') { callback({ error: 'Игра уже идёт' }); return; }

    const isFirst = room.players.size === 0;
    const player = { id: socket.id, name: data.playerName, score: 0, avatar: data.avatar || 0, isHost: isFirst, achievements: [] };
    room.players.set(socket.id, player);
    socket.join(data.roomId);

    callback({ playerId: socket.id, roomId: data.roomId, isHost: isFirst });
    io.to(data.roomId).emit('room-update', { players: getPlayers(room), roomId: data.roomId });
    console.log(`[join] ${data.playerName} -> ${data.roomId}`);
  });

  socket.on('set-avatar', (data) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) { player.avatar = data.avatar; }
    io.to(data.roomId).emit('room-update', { players: getPlayers(room), roomId: data.roomId });
  });

  socket.on('update-settings', (data) => {
    const room = rooms.get(data.roomId);
    if (!room || room.hostId !== socket.id) return;
    Object.assign(room.settings, data.settings);
    io.to(data.roomId).emit('settings-update', room.settings);
  });

  socket.on('start-game', (data) => {
    const room = rooms.get(data.roomId);
    if (!room || room.hostId !== socket.id) return;

    room.settings.gameType = data.gameType || 'quiz';
    room.settings.totalRounds = data.totalRounds || 10;
    room.settings.roundTime = data.roundTime || 15;
    room.state.status = 'playing';
    room.state.currentRound = 1;
    room.state.totalRounds = room.settings.totalRounds;
    room.state.questionIndex = 0;
    room.state.answers.clear();
    room.state.dareVotes.clear();

    io.to(data.roomId).emit('game-start', { gameType: room.settings.gameType });
    sendQuestion(room);
  });

  socket.on('submit-answer', (data) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    room.state.answers.set(socket.id, { answer: data.answer, timeSpent: data.timeSpent });
    io.to(data.roomId).emit('player-answered', { total: room.players.size, answered: room.state.answers.size });
    if (room.state.answers.size >= room.players.size) { processRound(room); }
  });

  socket.on('submit-dare-vote', (data) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    room.state.dareVotes.set(socket.id, data.completed);
    io.to(data.roomId).emit('player-voted', { total: room.players.size, voted: room.state.dareVotes.size });
    if (room.state.dareVotes.size >= room.players.size) { processRound(room); }
  });

  socket.on('next-round', (data) => {
    const room = rooms.get(data.roomId);
    if (!room || room.hostId !== socket.id) return;
    clearTimer(data.roomId);

    if (room.state.currentRound >= room.state.totalRounds) {
      room.state.status = 'finished';
      io.to(data.roomId).emit('game-over', { leaderboard: getLeaderboard(room), winner: getLeaderboard(room)[0] || null });
      return;
    }

    room.state.currentRound++;
    room.state.questionIndex++;
    room.state.answers.clear();
    room.state.dareVotes.clear();
    room.state.currentTask = undefined;
    sendQuestion(room);
  });

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        if (room.players.size === 0) { rooms.delete(roomId); }
        else { io.to(roomId).emit('room-update', { players: getPlayers(room), roomId }); }
      }
      if (room.hostId === socket.id && room.players.size > 0) {
        const newHost = room.players.values().next().value;
        if (newHost) { newHost.isHost = true; room.hostId = newHost.id; }
        io.to(roomId).emit('host-change', { hostId: room.hostId });
      }
    }
  });
});

function sendQuestion(room) {
  const q = getNextQuestion(room);
  if (!q) {
    room.state.status = 'finished';
    io.to(room.id).emit('game-over', { leaderboard: getLeaderboard(room), winner: getLeaderboard(room)[0] || null });
    return;
  }
  room.state.questionStartTime = Date.now();
  io.to(room.id).emit('new-question', q);

  timers.set(room.id, setTimeout(() => { processRound(room); }, room.settings.roundTime * 1000));
}

function getNextQuestion(room) {
  const type = room.settings.gameType;
  const questions = require('./questions.json');
  if (type === 'quiz') {
    const qs = questions.quiz;
    if (room.state.questionIndex >= qs.length) return null;
    const q = qs[room.state.questionIndex];
    return { type: 'quiz', question: q.question, options: q.options, correctIndex: q.correctIndex, timeLimit: room.settings.roundTime, round: room.state.currentRound, total: room.state.totalRounds };
  }
  if (type === 'truth_or_dare') {
    const task = questions.truth_or_dare[Math.floor(Math.random() * questions.truth_or_dare.length)];
    room.state.currentTask = task;
    return { type: 'truth_or_dare', taskType: task.type, text: task.text, points: task.points, round: room.state.currentRound, total: room.state.totalRounds, timeLimit: room.settings.roundTime };
  }
  if (type === 'who_am_i') {
    const qs = questions.who_am_i;
    if (room.state.questionIndex >= qs.length) return null;
    const q = qs[room.state.questionIndex];
    return { type: 'who_am_i', clues: q.clues, answer: q.answer, options: q.options, correctIndex: q.correctIndex, timeLimit: room.settings.roundTime, round: room.state.currentRound, total: room.state.totalRounds };
  }
  if (type === 'guess_media') {
    const qs = questions.guess_media;
    if (room.state.questionIndex >= qs.length) return null;
    const q = qs[room.state.questionIndex];
    return { type: 'guess_media', question: q.answer, options: q.options, correctIndex: q.correctIndex, timeLimit: room.settings.roundTime, round: room.state.currentRound, total: room.state.totalRounds };
  }
  return null;
}

function processRound(room) {
  clearTimer(room.id);
  const results = calculateResults(room);
  io.to(room.id).emit('round-results', { results, leaderboard: getLeaderboard(room), round: room.state.currentRound, total: room.state.totalRounds });
}

function calculateResults(room) {
  const type = room.settings.gameType;
  if (type === 'truth_or_dare') {
    const task = room.state.currentTask;
    const results = [];
    room.state.dareVotes.forEach((completed, playerId) => {
      results.push({ playerId, score: completed ? (task ? task.points : 10) : 0, correct: completed });
      if (completed) { const p = room.players.get(playerId); if (p) p.score += (task ? task.points : 10); }
    });
    return results;
  }

  const results = [];
  let correctIndex = 0;
  try {
    const questions = require('./questions.json');
    if (type === 'quiz') correctIndex = questions.quiz[room.state.questionIndex - 1]?.correctIndex ?? 0;
    else if (type === 'who_am_i') correctIndex = questions.who_am_i[room.state.questionIndex - 1]?.correctIndex ?? 0;
    else if (type === 'guess_media') correctIndex = questions.guess_media[room.state.questionIndex - 1]?.correctIndex ?? 0;
  } catch (e) {}

  room.state.answers.forEach((answer, playerId) => {
    const correct = answer.answer === correctIndex;
    const timeBonus = Math.max(0, Math.round((1 - answer.timeSpent / (room.settings.roundTime * 1000)) * 50));
    const score = correct ? 100 + timeBonus : 0;
    results.push({ playerId, score, correct });
    const p = room.players.get(playerId);
    if (p) p.score += score;
  });
  return results;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 PartyStation Server running on port ${PORT}`);
});
