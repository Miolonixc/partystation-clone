import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { RoundResult } from '../types';

interface ResultsScreenProps {
  results: RoundResult;
  onNextRound: () => void;
  isLastRound: boolean;
}

export function ResultsScreen({ results, onNextRound, isLastRound }: ResultsScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Раунд {results.round}/{results.total}
        </Text>
        <Text style={styles.subtitle}>Результаты</Text>
      </View>

      <ScrollView style={styles.leaderboard}>
        {results.leaderboard.map((p, i) => {
          const result = results.results.find(r => r.playerId === p.playerId);
          return (
            <View key={p.playerId} style={[
              styles.leaderItem,
              i === 0 && styles.leaderItemGold,
            ]}>
              <Text style={styles.place}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{p.playerName}</Text>
                {result?.correct !== undefined && (
                  <Text style={result.correct ? styles.correct : styles.wrong}>
                    {result.correct ? '✅' : '❌'}
                  </Text>
                )}
              </View>
              <Text style={styles.score}>{p.score}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {isLastRound
            ? 'Показать финальные результаты'
            : 'Хост нажмите для следующего раунда'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#aaa',
  },
  leaderboard: {
    flex: 1,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
  },
  leaderItemGold: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  place: {
    width: 60,
    fontSize: 32,
    textAlign: 'center',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  correct: {
    fontSize: 24,
  },
  wrong: {
    fontSize: 24,
  },
  score: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4ECDC4',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  hint: {
    fontSize: 18,
    color: '#666',
  },
});
