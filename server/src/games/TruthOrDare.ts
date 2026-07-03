import type { TruthOrDareTask } from '../types.js';

export const truthTasks: TruthOrDareTask[] = [
  { id: 't1', type: 'truth', text: 'Расскажи свой самый неловкий момент', points: 10 },
  { id: 't2', type: 'truth', text: 'Кого ты больше всего боялся в детстве?', points: 10 },
  { id: 't3', type: 'truth', text: 'Какая твоя самая большая тайна?', points: 15 },
  { id: 't4', type: 'truth', text: 'Ты когда-нибудь врал друзьям? О чём?', points: 10 },
  { id: 't5', type: 'truth', text: 'Какое твоё самое стыдное воспоминание?', points: 10 },
  { id: 't6', type: 'truth', text: 'Кто тебе нравился в школе?', points: 10 },
  { id: 't7', type: 'truth', text: 'Ты когда-нибудь крал еду из холодильника?', points: 10 },
  { id: 't8', type: 'truth', text: 'Какой твой самый большой страх?', points: 10 },
  { id: 't9', type: 'truth', text: 'Ты когда-нибудь проспал на работу/учёбу?', points: 10 },
  { id: 't10', type: 'truth', text: 'Какое твоё любимое guilty pleasure?', points: 10 },
];

export const dareTasks: TruthOrDareTask[] = [
  { id: 'd1', type: 'dare', text: 'Спой chorus любимой песни', points: 15 },
  { id: 'd2', type: 'dare', text: 'Сделай 10 приседаний', points: 10 },
  { id: 'd3', type: 'dare', text: 'Покажи свой последний селфи', points: 10 },
  { id: 'd4', type: 'dare', text: 'Замри на 30 секунд как статуя', points: 10 },
  { id: 'd5', type: 'dare', text: 'Расскажи анекдот', points: 15 },
  { id: 'd6', type: 'dare', text: 'Сделай голосом звук сирены', points: 10 },
  { id: 'd7', type: 'dare', text: 'Покажи свой танец', points: 15 },
  { id: 'd8', type: 'dare', text: 'Произнеси скороговорку 3 раза без ошибок', points: 15 },
  { id: 'd9', type: 'dare', text: 'Позвони другу и скажи "Я тебя люблю"', points: 20 },
  { id: 'd10', type: 'dare', text: 'Нарисуй портрет того, кто сидит справа', points: 15 },
];

export function getRandomTask(type: 'truth' | 'dare'): TruthOrDareTask {
  const tasks = type === 'truth' ? truthTasks : dareTasks;
  return tasks[Math.floor(Math.random() * tasks.length)];
}
