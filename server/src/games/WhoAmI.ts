import type { WhoAmIQuestion } from '../types.js';

export const whoAmIQuestions: WhoAmIQuestion[] = [
  {
    id: 'w1',
    clues: ['Я изобретён в России', 'Я могу говорить на разных языках', 'Меня создал Илон Маск'],
    answer: 'Grok',
    options: ['Grok', 'ChatGPT', 'Claude', 'Gemini'],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    id: 'w2',
    clues: ['Я — социальная сеть', 'У меня синяя птица', 'Меня купил Илон Маск'],
    answer: 'Twitter/X',
    options: ['Twitter/X', 'Instagram', 'TikTok', 'Facebook'],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    id: 'w3',
    clues: ['Я — страна в Азии', 'У меня больше всего населения', 'Великая Китайская стена'],
    answer: 'Китай',
    options: ['Китай', 'Индия', 'Япония', 'Корея'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'w4',
    clues: ['Я — планета Солнечной системы', 'Меня называют Красной', 'На мне есть самый большой вулкан'],
    answer: 'Марс',
    options: ['Марс', 'Венера', 'Юпитер', 'Сатурн'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'w5',
    clues: ['Я — напиток', 'Я бодрю', 'Меня делают из зёрен'],
    answer: 'Кофе',
    options: ['Кофе', 'Чай', 'Сок', 'Вода'],
    correctIndex: 0,
    timeLimit: 10,
  },
  {
    id: 'w6',
    clues: ['Я — персонаж фильма', 'Я говорю "Я — твой отец"', 'У меня красный меч'],
    answer: 'Дарт Вейдер',
    options: ['Дарт Вейдер', 'Голума', 'Терминатор', 'Робокоп'],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    id: 'w7',
    clues: ['Я — город', 'Меня называют городом ангелов', 'Во мне Голливуд'],
    answer: 'Лос-Анджелес',
    options: ['Лос-Анджелес', 'Нью-Йорк', 'Токио', 'Париж'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'w8',
    clues: ['Я — животное', 'Я самый быстрый на планете', 'У меня пятна'],
    answer: 'Гепард',
    options: ['Гепард', 'Лев', 'Тигр', 'Леопард'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'w9',
    clues: ['Я — фильм', 'Я про нео', 'Матрица — это не реальность'],
    answer: 'Матрица',
    options: ['Матрица', 'Интерстеллар', 'Аватар', 'Трансформеры'],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    id: 'w10',
    clues: ['Я — еда', 'Я итальянская', 'Меня едят с томатным соусом и сыром'],
    answer: 'Пицца',
    options: ['Пицца', 'Паста', 'Ризотто', 'Тирамису'],
    correctIndex: 0,
    timeLimit: 10,
  },
  {
    id: 'w11',
    clues: ['Я — страна', 'Я северная', 'У меня сауны и озёра'],
    answer: 'Финляндия',
    options: ['Финляндия', 'Швеция', 'Норвегия', 'Исландия'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'w12',
    clues: ['Я — приложение', 'У меня утка', 'Меня заблокировали в России'],
    answer: 'Telegram',
    options: ['Telegram', 'WhatsApp', 'Signal', 'Viber'],
    correctIndex: 0,
    timeLimit: 15,
  },
];

export function getRandomWhoAmI(count: number): WhoAmIQuestion[] {
  const shuffled = [...whoAmIQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
