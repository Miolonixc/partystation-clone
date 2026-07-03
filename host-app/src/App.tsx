import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSocket } from './hooks/useSocket';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { GameOverScreen } from './screens/GameOverScreen';

export default function App() {
  const { state, createRoom, startGame, nextRound, endGame } = useSocket();
  const [screen, setScreen] = useState<'lobby' | 'game' | 'results' | 'gameover'>('lobby');

  useEffect(() => {
    if (state.status === 'playing' && state.question) {
      setScreen('game');
    } else if (state.results) {
      setScreen('results');
    } else if (state.status === 'finished' && state.gameOver) {
      setScreen('gameover');
    }
  }, [state]);

  const handleCreateRoom = () => {
    createRoom('Хост');
  };

  const handleStartGame = () => {
    if (state.roomId) {
      startGame(state.roomId, {
        gameType: 'quiz',
        totalRounds: 10,
        roundTime: 15,
      });
    }
  };

  const handleNextRound = () => {
    if (state.roomId) {
      nextRound(state.roomId);
    }
  };

  if (screen === 'gameover' && state.gameOver) {
    return (
      <GameOverScreen
        leaderboard={state.gameOver.leaderboard}
        winner={state.gameOver.winner}
      />
    );
  }

  if (screen === 'results' && state.results) {
    return (
      <ResultsScreen
        results={state.results}
        onNextRound={handleNextRound}
        isLastRound={state.results.round >= state.results.total}
      />
    );
  }

  if (screen === 'game' && state.question) {
    return (
      <GameScreen
        question={state.question}
        answered={state.answered}
        total={state.total}
        onNextRound={handleNextRound}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LobbyScreen
        roomId={state.roomId}
        players={state.players}
        onStart={handleStartGame}
      />
      {!state.roomId && (
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateRoom}>
          <Text style={styles.createBtnText}>Создать комнату</Text>
        </TouchableOpacity>
      )}
      {state.roomId && state.players.length > 0 && (
        <TouchableOpacity style={styles.startBtn} onPress={handleStartGame}>
          <Text style={styles.startBtnText}>🎮 Начать игру</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createBtn: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  startBtn: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
});
