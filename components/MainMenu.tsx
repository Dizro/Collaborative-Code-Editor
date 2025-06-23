"use client";

import { useState } from "react";
import CreateRoomDialog from "./CreateRoomDialog";
import JoinRoomDialog from "./JoinRoomDialog";
import type { UserData } from "@/types/room";
import Image from "next/image";

interface Props {
  userData: UserData;
  onSignOut: () => void;
}

export default function MainMenu({ userData, onSignOut }: Props) {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-background-secondary flex flex-col items-center justify-center p-4">
        <button onClick={() => setMode("menu")} className="absolute top-6 left-6 text-foreground-secondary hover:text-foreground flex items-center gap-2 transition-colors duration-200">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Назад
        </button>
        <CreateRoomDialog userData={userData} />
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen bg-background-secondary flex flex-col items-center justify-center p-4">
        <button onClick={() => setMode("menu")} className="absolute top-6 left-6 text-foreground-secondary hover:text-foreground flex items-center gap-2 transition-colors duration-200">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Назад
        </button>
        <JoinRoomDialog userData={userData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <button onClick={onSignOut} className="px-4 py-2 bg-background text-foreground-secondary border border-border rounded-xl hover:text-foreground hover:border-primary/50 transition-colors duration-200 text-sm font-medium">
          Выйти
        </button>
      </div>

      <div className="bg-background p-8 rounded-2xl shadow-lg w-full max-w-sm text-center border border-border">
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src={userData.avatar} alt={userData.username} width={80} height={80} className="rounded-full object-cover ring-2 ring-primary/20" />
          </div>
          <h2 className="text-xl font-medium text-foreground">
            Добро пожаловать, {userData.username}!
          </h2>
        </div>

        <div className="space-y-3">
          <button onClick={() => setMode("create")} className="w-full p-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium text-sm">
            Создать комнату
          </button>
          <button onClick={() => setMode("join")} className="w-full p-3.5 bg-background-secondary text-foreground-secondary border border-border rounded-xl hover:border-primary/50 transition-colors duration-200 font-medium text-sm">
            Присоединиться к комнате
          </button>
        </div>
      </div>
    </div>
  );
}
