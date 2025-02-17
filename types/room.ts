// Типы для работы с комнатами и взаимодействиями пользователей

// Настройки комнаты
export interface RoomSettings {
  isPrivate: boolean;               // Приватная ли комната
  enableVoiceChat: boolean;         // Включен ли голосовой чат
  enableTextChat: boolean;          // Включен ли текстовый чат
  requireVoteForCompilation: boolean; // Требуется ли голосование для компиляции
  roomName: string;                 // Название комнаты
  description?: string;             // Описание комнаты
  maxUsers?: number;                // Максимальное число пользователей
  [key: string]: boolean | string | number | undefined; // Дополнительные поля
}

// Данные пользователя
export interface UserData {
  id: string;                      // ID пользователя
  username: string;                // Имя пользователя
  avatar: string;                  // Путь к аватару
  info: {
      avatar: string;              // Путь к аватару в info
      color: [string, string];     // Градиент цвета пользователя
  };
}

// Тип сообщения в чате
export type ChatMessage = {
  id: string;                      // ID сообщения
  text: string;                    // Текст сообщения 
  userId: string;                  // ID отправителя
  username: string;                // Имя отправителя
  timestamp: number;               // Временная метка
  [key: string]: string | number;  // Дополнительные поля
};

// Интерфейс файла в хранилище
export interface StorageFile {
  content: string;                 // Содержимое файла
  type: "file" | "directory";      // Тип: файл или директория
  language: string;                // Язык программирования
  lastEditedBy: string;            // Кем последним редактировался
  lastEditedAt: number;            // Когда последний раз редактировался
  [key: string]: string | number | undefined; // Дополнительные поля
}

// Интерфейс реакции на код
export interface Reaction {
  id: string;                     // ID реакции
  x: number;                      // Позиция по X
  y: number;                      // Позиция по Y 
  emoji: string;                  // Эмодзи реакции
  username: string;               // Имя пользователя
  timestamp: number;              // Временная метка
  lineNumber?: number;            // Номер строки кода
  comment?: string;               // Комментарий к реакции
}