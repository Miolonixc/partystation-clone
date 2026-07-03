# PartyStation Clone

Интерактивная платформа для вечеринок: хост запускает игру на TV, игроки подключаются по QR-коду на телефонах.

## Архитектура

```
┌─────────────┐     WebSocket      ┌──────────────┐
│  TV/Хост    │◄──────────────────►│   Server     │
│ (React      │                    │   Node.js    │
│  Native)    │                    │   + Socket.IO│
└─────────────┘                    └──────┬───────┘
                                          │
                              ┌───────────┴───────────┐
                       ┌──────┴──────┐         ┌──────┴──────┐
                       │  Phone 1    │         │  Phone N    │
                       │ (Web App)   │         │ (Web App)   │
                       └─────────────┘         └─────────────┘
```

## Структура проекта

```
partystation-clone/
├── server/                    # Node.js сервер
│   ├── src/
│   │   ├── index.ts          # Express + Socket.IO
│   │   ├── Room.ts           # Управление комнатами
│   │   ├── GameEngine.ts     # Движок игр
│   │   ├── types.ts          # Типы данных
│   │   └── games/
│   │       ├── Quiz.ts       # Викторина (10 вопросов)
│   │       ├── TruthOrDare.ts # Правда или действие (20 заданий)
│   │       ├── GuessMedia.ts  # Угадай медиа (6 вопросов)
│   │       └── MiniGames.ts   # Реакция, память, паттерн
│   ├── package.json
│   └── tsconfig.json
│
├── player-app/               # Веб-приложение (игроки)
│   ├── src/
│   │   ├── App.tsx           # Роутинг экранов
│   │   ├── types.ts          # Типы данных
│   │   ├── hooks/
│   │   │   └── useSocket.ts  # Socket.IO хук
│   │   └── screens/
│   │       ├── JoinScreen.tsx    # Вход
│   │       ├── WaitingScreen.tsx # Ожидание
│   │       ├── GameScreen.tsx    # Игра
│   │       ├── ResultScreen.tsx  # Результаты раунда
│   │       └── GameOverScreen.tsx # Финал
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── host-app/                 # React Native TV (хост)
    ├── src/
    │   ├── App.tsx           # Главный компонент
    │   ├── index.ts          # Точка входа
    │   ├── types.ts          # Типы данных
    │   ├── hooks/
    │   │   └── useSocket.ts  # Socket.IO хук
    │   └── screens/
    │       ├── LobbyScreen.tsx    # Лобби с QR-кодом
    │       ├── GameScreen.tsx     # Вопрос на TV
    │       ├── ResultsScreen.tsx  # Лидерборд
    │       └── GameOverScreen.tsx # Финальная таблица
    ├── android/
    │   └── app/src/main/
    │       ├── AndroidManifest.xml
    │       └── res/values/strings.xml
    ├── package.json
    └── tsconfig.json
```

## Быстрый старт

### 1. Установка зависимостей

```bash
# Сервер
cd server && npm install

# Веб-приложение
cd ../player-app && npm install

# Хост-приложение
cd ../host-app && npm install
```

### 2. Запуск

```bash
# Терминал 1: Сервер
cd server && npm run dev

# Терминал 2: Веб-приложение
cd player-app && npm run dev

# Терминал 3: Хост (Android)
cd host-app && npm run android

# Или для Android TV:
cd host-app && npm run tv
```

### 3. Использование

1. Хост открывает приложение → создаёт комнату
2. На TV отображается QR-код и код комнаты
3. Игроки сканируют QR-код или переходят по ссылке
4. Вводят имя → попадают в лобби
5. Хост нажимает "Начать игру"
6. Все видят вопрос на своих экранах
7. Игроки отвечают на телефонах
8. Результаты отображаются на TV
9. После всех раундов — финальная таблица

## Типы игр

### Викторина (Quiz)
- 10-20 вопросов с 4 вариантами ответа
- Таймер 10-30 секунд
- Баллы: 100 за правильный + бонус за скорость
- Визуал: вопрос крупно на TV, варианты на телефонах

### Правда или Действие (Truth or Dare)
- 20 заданий (10 правда, 10 действий)
- Игрок выбирает тип
- Голосование группы: выполнил/не выполнил
- Очки за выполнение

### Угадай Медиа (Guess Media)
- Аудио, видео или изображение
- Угадай название/ответ
- 4 варианта ответа
- Таймер + опоздание = меньше очков

### Мини-игры (Mini Games)
- **Реакция:** Кто первый нажал кнопку
- **Память:** Запомни последовательность
- **Паттерн:** Повтори цвета

## Socket.IO Протокол

### Хост → Сервер

| Event | Payload | Описание |
|-------|---------|----------|
| `create-room` | `{hostName}` | Создать комнату |
| `start-game` | `{roomId, settings}` | Начать игру |
| `next-round` | `{roomId}` | Следующий раунд |
| `end-game` | `{roomId}` | Завершить игру |

### Игрок → Сервер

| Event | Payload | Описание |
|-------|---------|----------|
| `join-room` | `{roomId, playerName}` | Войти в комнату |
| `submit-answer` | `{roomId, answer, timeSpent}` | Отправить ответ |
| `submit-dare-vote` | `{roomId, completed}` | Голос за действие |

### Сервер → Все

| Event | Payload | Описание |
|-------|---------|----------|
| `room-update` | `{players, roomId}` | Обновление списка |
| `game-start` | `{gameType}` | Игра началась |
| `new-question` | `{question, options, timer}` | Новый вопрос |
| `player-answered` | `{playerId, total, answered}` | Игрок ответил |
| `round-results` | `{results, leaderboard}` | Результаты раунда |
| `game-over` | `{leaderboard, winner}` | Игра окончена |
| `host-disconnected` | `{}` | Хост отключился |

## Типы данных

```typescript
interface Player {
  id: string;
  name: string;
  score: number;
}

interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  settings: RoomSettings;
  state: GameState;
}

interface RoomSettings {
  gameType: 'quiz' | 'truth_or_dare' | 'guess_media' | 'mini_game';
  maxPlayers: number;
  roundTime: number;
  totalRounds: number;
}
```

## Дизайн

### Цвета
- Primary: `#6C63FF` (фиолетовый)
- Secondary: `#FF6B6B` (красный)
- Accent: `#4ECDC4` (бирюзовый)
- Background: `#1A1A2E` (тёмный)
- Text: `#FFFFFF`

### Хост (TV)
- Ландшафтная ориентация
- Крупные элементы (читаемость с дивана)
- QR-код по центру в лобби
- Таймер-кольцо во время игры
- Топ-3 с медалями в результатах

### Игрок (Телефон)
- Портретная ориентация
- Удобные кнопки ответов
- Минимум текста
- Быстрая навигация

## Стек технологий

| Компонент | Технологии |
|-----------|-----------|
| Сервер | Node.js, Express, Socket.IO, TypeScript |
| Веб-приложение | React 18, Vite, TypeScript |
| Хост-приложение | React Native TV, TypeScript |
| Анимации | React Native Reanimated |
| QR-код | react-native-qrcode-svg |
| Стили | Inline styles, градиенты |

## Порты

| Сервис | Порт |
|--------|------|
| Сервер | 3000 |
| Веб-приложение | 5173 |

## Тестирование

```bash
# Проверка здоровья сервера
curl http://localhost:3000/health

# Ожидаемый ответ:
# {"status":"ok","rooms":0}
```

## Развитие

### Возможные улучшения
- Добавить больше вопросов в базу
- Реализовать кастомные игры через админку
- Добавить звуки и музыку
- Экспорт результатов в PDF
- История игр
- Авторизация через соцсети

### Добавление новой игры

1. Создать файл `server/src/games/NewGame.ts`
2. Добавить тип в `server/src/types.ts`
3. Реализовать логику в `GameEngine.ts`
4. Добавить экран в `player-app` и `host-app`
