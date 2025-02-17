// Клиент и типы для работы с Liveblocks
import { createClient, LiveMap, LiveObject } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { RoomSettings, StorageFile, ChatMessage, Reaction } from '@/types/room';
import type { JsonObject } from "@liveblocks/client";

// Создаем Liveblocks клиент
const client = createClient({
 publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!, // Публичный ключ API
 throttle: 16, // Частота обновлений
});

// Тип для позиции курсора
export type CursorPosition = {
 x: number;           // Позиция по X
 y: number;           // Позиция по Y
 lineNumber?: number; // Номер строки
 column?: number;     // Номер колонки
};

// Тип для данных присутствия пользователя
export type Presence = JsonObject & {
 cursor: CursorPosition | null;      // Позиция курсора
 selectedFile: string | null;        // Выбранный файл
 username: string;                   // Имя пользователя
 avatar: string;                     // Аватар
 cursorStyle: string;               // Стиль курсора
 isTyping: boolean;                 // Печатает ли
 isSpeaking: boolean;               // Говорит ли
 selection?: {                      // Выделенный текст
   start: number;
   end: number;
   lineNumber: number;
 };
 focusedId?: string | null;        // ID в фокусе
 reactions: Array<{                 // Массив реакций
   emoji: string;
   timestamp: number;
   userId: string;
   [key: string]: string | number;
 }>;
};

// Тип для хранилища данных
export type Storage = {
 files: LiveMap<string, StorageFile>;                // Файлы
 roomSettings: LiveObject<RoomSettings>;             // Настройки комнаты
 messages: LiveMap<string, ChatMessage>;             // Сообщения
 compilationVotes: LiveMap<string, boolean>;         // Голоса за компиляцию
};

// Создаем контекст комнаты и экспортируем хуки
export const {
 RoomProvider,       // Провайдер комнаты
 useMyPresence,      // Хук для работы с присутствием
 useStorage,         // Хук для работы с хранилищем
 useMutation,        // Хук для мутаций
 useOthers,          // Хук для других пользователей
 useBroadcastEvent,  // Хук для рассылки событий
 useEventListener,   // Хук для прослушивания событий
} = createRoomContext<Presence, Storage>(client);

// Экспортируем дополнительные типы
export type { Reaction, StorageFile };

// Экспортируем клиент
export { client };