// Тип для сообщений чата
export type ChatMessage = {
  id: string;                   // Уникальный ID сообщения
  userId: string;              // ID отправителя
  username: string;            // Имя отправителя
  content: string;             // Контент сообщения  
  timestamp: number;           // Временная метка
  type: 'text' | 'system';     // Тип сообщения
  [key: string]: string | number; // Дополнительные поля
 };
 
 // Тип для реакций пользователей
 export type Reaction = {
  emoji: string;               // Эмодзи реакции
  timestamp: number;           // Временная метка
  userId: string;              // ID пользователя
  [key: string]: string | number; // Дополнительные поля
 };
 
 // Тип для состояния присутствия пользователя
 export type Presence = {
  cursor: { x: number; y: number } | null;  // Позиция курсора
  selectedFile: string | null;               // Выбранный файл
  username: string;                          // Имя пользователя
  avatar: string;                            // Аватар
  cursorStyle: string;                       // Стиль курсора
  isTyping: boolean;                         // Печатает ли
  isSpeaking: boolean;                       // Говорит ли
  reactions: {                               // Массив реакций
    emoji: string;
    timestamp: number;
    userId: string;
    [key: string]: string | number;
  }[];
  // Индексная сигнатура для доп. полей
  [key: string]: string | number | boolean | null | object | (string | number | boolean | null | object)[];
 };