import type { QuizQuestion } from '../types.js';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Какая столица Франции?',
    options: ['Лондон', 'Париж', 'Берлин', 'Мадрид'],
    correctIndex: 1,
    timeLimit: 15,
  },
  {
    id: 'q2',
    question: 'Сколько планет в Солнечной системе?',
    options: ['7', '8', '9', '10'],
    correctIndex: 1,
    timeLimit: 15,
  },
  {
    id: 'q3',
    question: 'Кто написал "Войну и мир"?',
    options: ['Достоевский', 'Тургенев', 'Толстой', 'Чехов'],
    correctIndex: 2,
    timeLimit: 20,
  },
  {
    id: 'q4',
    question: 'Какой газ составляет основу атмосферы Земли?',
    options: ['Кислород', 'Азот', 'Углекислый газ', 'Водород'],
    correctIndex: 1,
    timeLimit: 15,
  },
  {
    id: 'q5',
    question: 'В каком году была основана Москва?',
    options: ['1147', '1221', '1325', '1478'],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    id: 'q6',
    question: 'Какая самая большая река в мире?',
    options: ['Амазонка', 'Нил', 'Янцзы', 'Миссисипи'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'q7',
    question: 'Сколько костей в теле взрослого человека?',
    options: ['186', '206', '226', '256'],
    correctIndex: 1,
    timeLimit: 15,
  },
  {
    id: 'q8',
    question: 'Какой фильм получил Оскар за лучший фильм в 2020 году?',
    options: ['Паразиты', 'Джокер', 'Однажды в Голливуде', '1917'],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    id: 'q9',
    question: 'Какой металл самый лёгкий?',
    options: ['Гелий', 'Литий', 'Водород', 'Алюминий'],
    correctIndex: 2,
    timeLimit: 15,
  },
  {
    id: 'q10',
    question: 'Кто изобрёл телефон?',
    options: ['Тесла', 'Белл', 'Эдисон', 'Морзе'],
    correctIndex: 1,
    timeLimit: 15,
  },
];

export function getRandomQuestions(count: number): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
