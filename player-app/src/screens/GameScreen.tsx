import { useState, useEffect, useRef } from 'react';
import type { Question } from '../types';

interface GameScreenProps {
  question: Question;
  onAnswer: (answer: number, timeSpent: number) => void;
  onDareVote: (completed: boolean) => void;
  answered: boolean;
}

export function GameScreen({ question, onAnswer, onDareVote, answered }: GameScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 15);
  const startTimeRef = useRef(Date.now());
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;

  useEffect(() => {
    setSelected(null);
    setTimeLeft(question.timeLimit || 15);
    startTimeRef.current = Date.now();
  }, [question]);

  useEffect(() => {
    if (answered || question.type === 'truth_or_dare') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          onAnswerRef.current(-1, Date.now() - startTimeRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answered, question]);

  const handleSelect = (index: number) => {
    if (answered || selected !== null) return;
    setSelected(index);
    onAnswer(index, Date.now() - startTimeRef.current);
  };

  if (question.type === 'truth_or_dare') {
    return (
      <div style={styles.container}>
        <div style={styles.roundBadge}>
          Раунд {question.round}/{question.total}
        </div>
        <div style={{ ...styles.card, ...styles.dareCard }}>
          <div style={styles.dareType}>
            {question.taskType === 'truth' ? '🎤 Правда' : '⚡ Действие'}
          </div>
          <p style={styles.dareText}>{question.text}</p>
          <p style={styles.darePoints}>+{question.points} очков</p>

          {!answered && (
            <div style={styles.dareButtons}>
              <button
                style={{ ...styles.dareBtn, ...styles.dareBtnYes }}
                onClick={() => onDareVote(true)}
                aria-label="Выполнил задание"
              >
                ✅ Выполнил
              </button>
              <button
                style={{ ...styles.dareBtn, ...styles.dareBtnNo }}
                onClick={() => onDareVote(false)}
                aria-label="Не выполнил задание"
              >
                ❌ Не выполнил
              </button>
            </div>
          )}

          {answered && (
            <div style={styles.submittedBadge}>
              <span style={styles.submittedCheck}>✓</span>
              <span>Отправлено!</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.roundBadge}>
          Раунд {question.round}/{question.total}
        </div>
        <div style={styles.timer}>
          <svg style={styles.timerSvg} viewBox="0 0 36 36" aria-hidden="true">
            <path
              style={styles.timerBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeDasharray="100, 100"
            />
            <path
              style={{
                ...styles.timerProgress,
                strokeDasharray: `${(timeLeft / (question.timeLimit || 15)) * 100}, 100`,
              }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
            />
          </svg>
          <span style={styles.timerText}>{timeLeft}</span>
          <span style={styles.srOnly}>Осталось {timeLeft} секунд</span>
        </div>
      </div>

      <div style={styles.questionCard}>
        <p style={styles.questionText}>{question.question}</p>
      </div>

      <div style={styles.options}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            style={{
              ...styles.optionBtn,
              ...(selected === i ? styles.optionSelected : {}),
              ...(answered && selected !== i ? styles.optionDisabled : {}),
            }}
            onClick={() => handleSelect(i)}
            disabled={answered}
            aria-pressed={selected === i}
            aria-label={`Вариант ${String.fromCharCode(65 + i)}: ${opt}`}
          >
            <span style={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
            <span>{opt}</span>
            {selected === i && answered && (
              <span style={styles.checkMark}>✓</span>
            )}
          </button>
        ))}
      </div>

      {answered && (
        <div style={styles.submittedBadge}>
          <span style={styles.submittedCheck}>✓</span>
          <span>Отправлено! Ожидаем других...</span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    paddingTop: 40,
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roundBadge: {
    fontSize: 14,
    fontWeight: 600,
    padding: '6px 14px',
    borderRadius: 20,
    background: 'rgba(108,99,255,0.3)',
    border: '1px solid rgba(108,99,255,0.5)',
    textAlign: 'center',
  },
  timer: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  timerSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  timerBg: {
    stroke: 'rgba(255,255,255,0.1)',
    strokeWidth: 3,
  },
  timerProgress: {
    stroke: '#4ECDC4',
    strokeWidth: 3,
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 1s linear',
  },
  timerText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 20,
    fontWeight: 700,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    border: 0,
  },
  questionCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    padding: '16px 20px',
    borderRadius: 14,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionSelected: {
    borderColor: '#6C63FF',
    background: 'rgba(108,99,255,0.2)',
  },
  optionDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  checkMark: {
    marginLeft: 'auto',
    color: '#4ECDC4',
    fontSize: 20,
    fontWeight: 700,
  },
  dareCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 32,
    textAlign: 'center',
  },
  dareType: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
  },
  dareText: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.4,
    marginBottom: 16,
  },
  darePoints: {
    fontSize: 18,
    color: '#4ECDC4',
    marginBottom: 30,
  },
  dareButtons: {
    display: 'flex',
    gap: 12,
  },
  dareBtn: {
    flex: 1,
    padding: '14px 0',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    color: '#fff',
  },
  dareBtnYes: {
    background: 'linear-gradient(135deg, #4ECDC4, #44B09E)',
  },
  dareBtnNo: {
    background: 'linear-gradient(135deg, #FF6B6B, #ee5a24)',
  },
  submittedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: '12px 20px',
    borderRadius: 12,
    background: 'rgba(78,205,196,0.15)',
    border: '1px solid rgba(78,205,196,0.3)',
    color: '#4ECDC4',
    fontWeight: 600,
    fontSize: 16,
  },
  submittedCheck: {
    fontSize: 20,
    fontWeight: 700,
  },
};
