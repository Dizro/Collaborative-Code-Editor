// config/liveblocks.ts
import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { StorageFile } from "@/types/room";

if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is missing");
}

export const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
  throttle: 100,
});

export type Presence = {
  cursor: {
    x: number;
    y: number;
    lineNumber: number;
    column: number;
  } | null;
  selectedFile: string | null;
  username: string;
  avatar: string;
  cursorStyle: string;
  isTyping: boolean;
  isSpeaking: boolean;
  reactions: any[];
};

export type Storage = {
  files: LiveMap<string, StorageFile>;
  roomSettings: { [key: string]: any };
  messages: LiveMap<string, any>;
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