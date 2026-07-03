import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { Player } from '../types';

interface GameOverScreenProps {
  leaderboard: Player[];
  winner: Player;
}

export function GameOverScreen({ leaderboard, winner }: GameOverScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Игра окончена!</Text>

      <View style={styles.winnerBox}>
        <View style={styles.winnerAvatar}>
          <Text style={styles.winnerAvatarText}>
            {winner?.playerName?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.winnerName}>{winner?.playerName || 'Игрок'}</Text>
        <Text style={styles.winnerScore}>{winner?.score || 0} очков</Text>
        <Text style={styles.winnerLabel}>ПОБЕДИТЕЛЬ</Text>
      </View>

      <ScrollView style={styles.leaderboard}>
        {leaderboard.map((p, i) => (
          <View key={p.id} style={[
            styles.leaderItem,
            i === 0 && styles.leaderItemGold,
          ]}>
            <Text style={styles.place}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
            </Text>
            <Text style={styles.playerName}>{p.name}</Text>
            <Text style={styles.score}>{p.score}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.hint}>Спасибо за игру! 🎉</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 40,
  },
  winnerBox: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    marginBottom: 40,
    width: '100%',
    maxWidth: 600,
  },
  winnerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  winnerAvatarText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
  },
  winnerName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  winnerScore: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 12,
  },
  winnerLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 6,
    color: '#FFD700',
  },
  leaderboard: {
    width: '100%',
    maxWidth: 600,
    flex: 1,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 8,
  },
  leaderItemGold: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  place: {
    width: 50,
    fontSize: 28,
    textAlign: 'center',
  },
  playerName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  score: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4ECDC4',
  },
  footer: {
    marginTop: 40,
  },
  hint: {
    fontSize: 20,
    color: '#666',
  },
});
