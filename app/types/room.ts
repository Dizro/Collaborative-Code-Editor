// Типы для работы с комнатами и взаимодействиями пользователей

// Настройки комнаты
export interface RoomSettings {
  isPrivate: boolean;
  enableVoiceChat: boolean;
  enableTextChat: boolean;
  requireVoteForCompilation: boolean;
  roomName: string;
  description?: string;
  maxUsers?: number;
  allowedUsers: string[];
  // FIX: Индексная сигнатура, вызывавшая конфликт, удалена.
}

// Данные пользователя
export interface UserData {
  id: string;
  username: string;
  avatar: string;
  info: {
      avatar: string;
      color: [string, string];
  };
}

// Тип сообщения в чате
export type ChatMessage = {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: number;
  type: "text" | "system";
};

// Интерфейс файла в хранилище
export interface StorageFile {
  content: string;
  type: "file" | "directory";
  language: string;
  lastEditedBy: string;
  lastEditedAt: number;
}

// Интерфейс реакции на код
export interface Reaction {
  id: string;
  x: number;
  y: number;
  emoji: string;
  username: string;
  timestamp: number;
  lineNumber?: number;
  comment?: string;
}
