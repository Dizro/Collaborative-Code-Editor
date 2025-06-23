"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomProvider, useOthers, useStorage, useMutation } from "@/liveblocks.config";
import { LiveMap, LiveObject } from "@liveblocks/client";
import Editor from "@/components/Editor";
import type { UserData, RoomSettings, StorageFile } from "@/types/room";
import Navbar from "@/components/room/Navbar";

// Начальные настройки комнаты
const defaultRoomSettings: RoomSettings = {
  roomName: "Default Room",
  isPrivate: false,
  enableVoiceChat: true,
  enableTextChat: true,
  requireVoteForCompilation: false,
  maxUsers: 10,
  description: "",
  allowedUsers: []
};

// Компонент комнаты с основной логикой
function Room({ userData, roomSettings }: { userData: UserData; roomSettings: RoomSettings }) {
  const params = useParams();
  const router = useRouter();
  const others = useOthers();
  const files = useStorage((root) => root.files);
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  // Создание начального файла при входе первого пользователя
  const createInitialFile = useMutation(({ storage }) => {
    const currentFiles = storage.get("files") as LiveMap<string, StorageFile>;
    if (currentFiles && currentFiles.size === 0) {
        currentFiles.set("welcome.md", {
            content: `# Добро пожаловать в CodeSync!\n\nЭто редактор для совместной работы. \nНачните с создания или открытия файла на боковой панели.`,
            type: "file",
            language: "markdown",
            lastEditedBy: userData.username,
            lastEditedAt: Date.now(),
        });
    }
  }, [userData.username]);


  // Инициализация файлов при входе первого пользователя
  useEffect(() => {
    if (others.length === 0 && files?.size === 0) {
        createInitialFile();
    }
  }, [others.length, files, createInitialFile]);

  if (!roomId) {
    return <div>Room not found...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar
        roomId={roomId}
        username={userData.username}
        isPrivate={roomSettings?.isPrivate || false}
        onNewRoom={() => {
          router.push(`/`);
        }}
        onLeave={() => {
          localStorage.removeItem("userData");
          router.push("/");
        }}
      />
      <div className="flex-1 relative overflow-hidden">
        <Editor username={userData.username} roomId={roomId} />
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
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  // Загрузка данных пользователя из localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    } else {
      router.push("/");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !userData || !roomId) {
    return <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">Загрузка...</div>;
  }

  // Инициализация провайдера Liveblocks с начальными данными
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selection: null,
        selectedFile: null,
        username: userData.username,
        avatar: userData.avatar,
        isTyping: false,
        isSpeaking: false,
      }}
      initialStorage={{
        files: new LiveMap<string, StorageFile>(),
        roomSettings: new LiveObject<RoomSettings>(defaultRoomSettings),
        messages: new LiveMap(),
        compilationVotes: new LiveMap(),
      }}
    >
      <RoomContent userData={userData} />
    </RoomProvider>
  );
}

function RoomContent({ userData }: { userData: UserData }) {
    // FIX: Правильное получение объекта настроек из useStorage
    const roomSettings = useStorage(root => root.roomSettings);

    if(!roomSettings) {
        return <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">Загрузка настроек комнаты...</div>;
    }

    return <Room userData={userData} roomSettings={roomSettings} />
}
