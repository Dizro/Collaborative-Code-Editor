import { createClient, LiveMap, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { RoomSettings, StorageFile, ChatMessage } from "@/types/room";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 100,
});

export type Selection = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type Presence = {
  // FIX: Убираем x и y, оставляем только позицию в коде
  cursor: {
    lineNumber: number;
    column: number;
  } | null;
  selection: Selection | null;
  selectedFile: string | null;
  username: string;
  avatar: string;
  isTyping: boolean;
  isSpeaking: boolean;
};

export type Storage = {
  files: LiveMap<string, StorageFile>;
  roomSettings: LiveObject<RoomSettings>;
  messages: LiveMap<string, ChatMessage>;
  compilationVotes: LiveMap<string, boolean>;
};

export const {
  RoomProvider,
  useMyPresence,
  useStorage,
  useMutation,
  useOthers,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage>(client);
