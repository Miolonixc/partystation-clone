import { useState, useEffect, useRef } from 'react';
import type { Question } from '../types';

const isHostMode = new URLSearchParams(window.location.search).get('host') === 'true';

interface GameScreenProps {
  question: Question;
  onAnswer: (answer: number, timeSpent: number) => void;
  onDareVote: (completed: boolean) => void;
  answered: boolean;
}

export function GameScreen({ question, onAnswer, onDareVote, answered }: GameScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const timeLimit = 'timeLimit' in question ? question.timeLimit : 15;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const startTimeRef = useRef(Date.now());
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;

  useEffect(() => {
    setSelected(null);
    setTimeLeft('timeLimit' in question ? question.timeLimit : 15);
    startTimeRef.current = Date.now();
  }, [question]);

  useEffect(() => {
    if (answered || question.type === 'truth_or_dare') return;
    const timer = setInterval(() => {
      setTimeLeft((t: number) => {
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
        <div style={styles.header}>
          <div style={styles.roundBadge}>
            Раунд {question.round}/{question.total}
          </div>
        </div>
        <div style={styles.dareCard}>
          <div style={styles.dareType}>
            {question.taskType === 'truth' ? '🎤' : '⚡'}{' '}
            {question.taskType === 'truth' ? 'Правда' : 'Действие'}
          </div>
          <p style={styles.dareText}>{question.text}</p>
          <div style={styles.darePoints}>+{question.points} очков</div>

          {!answered ? (
            <div style={styles.dareButtons}>
              <button
                style={{ ...styles.dareBtn, ...styles.dareBtnYes }}
                onClick={() => onDareVote(true)}
              >
                ✅ Выполнил
              </button>
              <button
                style={{ ...styles.dareBtn, ...styles.dareBtnNo }}
                onClick={() => onDareVote(false)}
              >
                ❌ Не выполнил
              </button>
            </div>
          ) : (
            <div style={styles.submittedBadge}>✓ Отправлено!</div>
          )}
        </div>
      </div>
    );
  }

  const questionText = 'question' in question ? question.question : '';
  const options = 'options' in question ? question.options : [];
  const timerPercent = (timeLeft / timeLimit) * 100;
  const timerColor = timeLeft <= 5 ? '#FF6B6B' : '#4ECDC4';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.roundBadge}>
          Раунд {question.round}/{question.total}
        </div>
        <div style={{ ...styles.timer, borderColor: timerColor }}>
          <svg style={styles.timerSvg} viewBox="0 0 36 36" aria-hidden="true">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <path
              style={{ ...styles.timerProgress, stroke: timerColor, strokeDasharray: `${timerPercent}, 100` }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
            />
          </svg>
          <span style={{ ...styles.timerText, color: timerColor }}>{timeLeft}</span>
        </div>
      </div>

      <div style={styles.questionCard}>
        <p style={styles.questionText}>{questionText}</p>
      </div>

      {!isHostMode && (
        <div style={styles.options}>
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              style={{
                ...styles.optionBtn,
                ...(selected === i ? styles.optionSelected : {}),
                ...(answered && selected !== i ? styles.optionDisabled : {}),
              }}
              onClick={() => handleSelect(i)}
              disabled={answered}
            >
              <span style={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
              <span style={styles.optionText}>{opt}</span>
              {selected === i && answered && <span style={styles.checkMark}>✓</span>}
            </button>
          ))}
        </div>
      )}

      {isHostMode && (
        <div style={styles.optionsDisplay}>
          {options.map((opt: string, i: number) => (
            <div key={i} style={styles.optionDisplayItem}>
              <span style={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
              <span style={styles.optionText}>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {answered && !isHostMode && (
        <div style={styles.submittedBadge}>✓ Отправлено! Ожидаем других...</div>
      )}

      {isHostMode && (
        <div style={styles.hostBadge}>📺 Режим хоста — ответы на телефонах</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 24,
    paddingTop: 48,
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  roundBadge: {
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 20,
    background: 'rgba(108,99,255,0.25)',
    color: '#a5a0ff',
  },
  timer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '3px solid #4ECDC4',
    transition: 'border-color 0.3s',
  },
  timerSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  timerProgress: {
    strokeWidth: 3,
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 1s linear, stroke 0.3s',
  },
  timerText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 20,
    fontWeight: 700,
    transition: 'color 0.3s',
  },
  questionCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 28,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.4,
    color: '#fff',
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
    padding: '18px 20px',
    borderRadius: 16,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  optionSelected: {
    borderColor: '#6C63FF',
    background: 'rgba(108,99,255,0.2)',
    boxShadow: '0 0 16px rgba(108,99,255,0.2)',
  },
  optionDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  checkMark: {
    color: '#4ECDC4',
    fontSize: 22,
    fontWeight: 700,
  },
  dareCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 40,
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  dareType: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 24,
  },
  dareText: {
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.4,
    marginBottom: 20,
    color: '#fff',
  },
  darePoints: {
    fontSize: 18,
    fontWeight: 600,
    color: '#4ECDC4',
    marginBottom: 32,
    padding: '8px 16px',
    borderRadius: 12,
    background: 'rgba(78,205,196,0.15)',
    display: 'inline-block',
  },
  dareButtons: {
    display: 'flex',
    gap: 12,
  },
  dareBtn: {
    flex: 1,
    padding: '16px 0',
    borderRadius: 14,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.2s',
  },
  dareBtnYes: {
    background: 'linear-gradient(135deg, #4ECDC4, #44B09E)',
    boxShadow: '0 4px 16px rgba(78,205,196,0.3)',
  },
  dareBtnNo: {
    background: 'linear-gradient(135deg, #FF6B6B, #ee5a24)',
    boxShadow: '0 4px 16px rgba(255,107,107,0.3)',
  },
  submittedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: '14px 24px',
    borderRadius: 14,
    background: 'rgba(78,205,196,0.15)',
    border: '1px solid rgba(78,205,196,0.3)',
    color: '#4ECDC4',
    fontWeight: 600,
    fontSize: 16,
  },
  optionsDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  optionDisplayItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    padding: '18px 20px',
    borderRadius: 16,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
  },
  hostBadge: {
    textAlign: 'center',
    marginTop: 24,
    padding: '12px 20px',
    borderRadius: 12,
    background: 'rgba(108,99,255,0.15)',
    border: '1px solid rgba(108,99,255,0.3)',
    color: '#a5a0ff',
    fontSize: 14,
    fontWeight: 500,
  },
};
