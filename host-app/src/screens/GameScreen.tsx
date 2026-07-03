import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import type { Question } from '../types';

interface GameScreenProps {
  question: Question;
  answered: number;
  total: number;
  onNextRound: () => void;
}

export function GameScreen({ question, answered, total, onNextRound }: GameScreenProps) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 15);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeLeft(question.timeLimit || 15);
  }, [question]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [question]);

  if (question.type === 'truth_or_dare') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.roundBadge}>
            Раунд {question.round}/{question.total}
          </Text>
        </View>

        <Animated.View style={[styles.dareCard, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.dareType}>
            {question.taskType === 'truth' ? '🎤 Правда' : '⚡ Действие'}
          </Text>
          <Text style={styles.dareText}>{question.text}</Text>
          <Text style={styles.darePoints}>+{question.points} очков</Text>
        </Animated.View>

        <View style={styles.progressBar}>
          <Text style={styles.progressText}>
            Голосов: {answered}/{total}
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${(answered / total) * 100}%`,
            }]} />
          </View>
        </View>
      </View>
    );
  }

  const colors = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFE66D'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundBadge}>
          Раунд {question.round}/{question.total}
        </Text>
        <View style={styles.timer}>
          <Text style={[
            styles.timerText,
            timeLeft <= 5 && styles.timerWarning,
          ]}>{timeLeft}</Text>
        </View>
        <Text style={styles.answerCount}>
          Ответили: {answered}/{total}
        </Text>
      </View>

      <Animated.View style={[styles.questionCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.questionText}>{question.question}</Text>
      </Animated.View>

      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <View key={i} style={[styles.optionBtn, { borderColor: colors[i] }]}>
            <Text style={[styles.optionLetter, { backgroundColor: colors[i] }]}>
              {String.fromCharCode(65 + i)}
            </Text>
            <Text style={styles.optionText}>{opt}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          Игроки отвечают на телефонах...
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  roundBadge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
    backgroundColor: 'rgba(108,99,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(78,205,196,0.2)',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#4ECDC4',
  },
  timerWarning: {
    color: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  answerCount: {
    fontSize: 18,
    color: '#aaa',
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 56,
  },
  options: {
    flex: 1,
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
  },
  optionLetter: {
    width: 48,
    height: 48,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 48,
    marginRight: 20,
  },
  optionText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
  },
  dareCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 60,
    alignItems: 'center',
    marginBottom: 40,
  },
  dareType: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  dareText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 64,
    marginBottom: 24,
  },
  darePoints: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  progressBar: {
    marginTop: 40,
  },
  progressText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerHint: {
    fontSize: 18,
    color: '#666',
  },
});
