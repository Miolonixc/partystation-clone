export interface MiniGameResult {
  playerId: string;
  score: number;
  data?: Record<string, unknown>;
}

export function calculateReactionScore(reactionTimeMs: number, timeLimitMs: number): number {
  if (reactionTimeMs > timeLimitMs) return 0;
  const maxPoints = 100;
  const penalty = (reactionTimeMs / timeLimitMs) * 50;
  return Math.round(maxPoints - penalty);
}

export function generateMemorySequence(length: number): number[] {
  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * 4));
  }
  return sequence;
}

export function generatePatternSequence(length: number): number[] {
  const sequence: number[] = [];
  const colors = [0, 1, 2, 3];
  for (let i = 0; i < length; i++) {
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  return sequence;
}

export function checkMemoryAnswer(expected: number[], playerAnswer: number[]): {
  correct: number;
  score: number;
} {
  let correct = 0;
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] === playerAnswer[i]) {
      correct++;
    }
  }
  const score = Math.round((correct / expected.length) * 100);
  return { correct, score };
}
