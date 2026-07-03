import type { GuessMediaItem } from '../types.js';

export const guessMediaItems: GuessMediaItem[] = [
  {
    id: 'gm1',
    mediaUrl: '',
    mediaType: 'audio',
    answer: 'Белые розы',
    options: ['Белые розы', 'Черные пятна', 'Синее небо', 'Зелёный лист'],
    correctIndex: 0,
    timeLimit: 30,
  },
  {
    id: 'gm2',
    mediaUrl: '',
    mediaType: 'image',
    answer: 'Пизанская башня',
    options: ['Пизанская башня', 'Эйфелева башня', 'Кремль', 'Статуя Свободы'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'gm3',
    mediaUrl: '',
    mediaType: 'audio',
    answer: 'Калинка-малинка',
    options: ['Калинка-малинка', 'Очи чёрные', 'Подмосковные вечера', 'Катюша'],
    correctIndex: 0,
    timeLimit: 30,
  },
  {
    id: 'gm4',
    mediaUrl: '',
    mediaType: 'image',
    answer: 'Колизей',
    options: ['Колизей', 'Парфенон', 'Пирамиды', 'Великая стена'],
    correctIndex: 0,
    timeLimit: 15,
  },
  {
    id: 'gm5',
    mediaUrl: '',
    mediaType: 'audio',
    answer: 'Interstellar Theme',
    options: ['Interstellar Theme', 'Inception Theme', 'Titanic Theme', 'Avatar Theme'],
    correctIndex: 0,
    timeLimit: 30,
  },
  {
    id: 'gm6',
    mediaUrl: '',
    mediaType: 'video',
    answer: 'Титаник',
    options: ['Титаник', 'Аватар', 'Звёздные войны', 'Гарри Поттер'],
    correctIndex: 0,
    timeLimit: 20,
  },
];

export function getRandomMediaItems(count: number): GuessMediaItem[] {
  const shuffled = [...guessMediaItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
