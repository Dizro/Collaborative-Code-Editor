// Клиентский компонент для отображения комнаты с редактором кода

// app\rooms\[roomId]\page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  RoomProvider,
  useOthers,
  useStorage,
  useMutation,
} from "@/liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import Editor from "@/components/Editor";
import type { StorageFile, UserData } from "@/types/room";
import Navbar from "@/components/room/Navbar";

// Компонент комнаты с основной логикой
function Room({ userData }: { userData: UserData }) {
  const params = useParams();
  const router = useRouter();
  const others = useOthers();
  const files = useStorage((root) => root.files);
  // Получаем ID комнаты из параметров URL
  const roomId = params?.roomId
    ? Array.isArray(params.roomId)
      ? params.roomId[0]
      : params.roomId
    : null;

  const roomSettings = useStorage((root) => root.roomSettings);

  // Создание начального файла при входе первого пользователя
  const createInitialFiles = useMutation(
    ({ storage }) => {
      if (!storage.get("files") || storage.get("files").size === 0) {
        const initialFiles = new LiveMap<string, StorageFile>();
        initialFiles.set("welcome.md", {
          content:
            "# Welcome to the Code Editor\nStart by creating or opening a file!",
          type: "file",
          language: "markdown",
          lastEditedBy: userData.username,
          lastEditedAt: Date.now(),
        });
        storage.set("files", initialFiles);
      }
    },
    [userData.username]
  );

  // Инициализация файлов при входе первого пользователя
  useEffect(() => {
    if (others.length === 0 && files) {
      if (!files || files.size === 0) {
        createInitialFiles();
      }
    }
  }, [others, files, createInitialFiles]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        roomId={roomId!}
        username={userData.username}
        isPrivate={roomSettings?.isPrivate || false}
        onNewRoom={() => {
          const newRoomId = `room-${Date.now()}`;
          router.push(`/rooms/${newRoomId}`);
        }}
        onLeave={() => {
          localStorage.removeItem("userData");
          router.push("/");
        }}
      />
      <div className="flex-1 relative">
        <Editor username={userData.username} roomId={roomId!} />
      </div>
    </div>
  );
}

// Главный компонент страницы комнаты
export default function RoomPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId
    ? Array.isArray(params.roomId)
      ? params.roomId[0]
      : params.roomId
    : null;

  // Загрузка данных пользователя из localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Редирект на главную если нет данных
  if (!userData || !roomId) {
    router.push("/");
    return null;
  }

  // Инициализация провайдера Liveblocks с начальными данными
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selectedFile: null,
        username: userData.username,
        avatar: userData.avatar,
        info: userData.info,
        cursorStyle: "default",
        isTyping: false,
        isSpeaking: false,
        reactions: [],
      }}
      initialStorage={{
        files: new LiveMap(),
        roomSettings: new LiveObject({
          roomName: "Default Room",
          isPrivate: false,
          enableVoiceChat: true,
          enableTextChat: true,
          requireVoteForCompilation: false,
          maxUsers: 10,
        }),
        messages: new LiveMap(),
        compilationVotes: new LiveMap(),
      }}
    >
      <Room userData={userData} />
    </RoomProvider>
  );
}
