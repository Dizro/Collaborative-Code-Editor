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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <button
          onClick={() => setMode("menu")}
          className="absolute top-6 left-6 text-[#9197A0] hover:text-[#323C46] flex items-center gap-2 transition-colors duration-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Назад
        </button>
        <CreateRoomDialog userData={userData} />
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <button
          onClick={() => setMode("menu")}
          className="absolute top-6 left-6 text-[#9197A0] hover:text-[#323C46] flex items-center gap-2 transition-colors duration-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Назад
        </button>
        <JoinRoomDialog userData={userData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="absolute top-6 right-6">
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-[#686B75] border border-[#9197A0] rounded-xl hover:text-[#323C46] hover:border-[#323C46] transition-colors duration-200 text-sm font-medium"
        >
          Выйти
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px] text-center border border-gray-100">
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image
              src={userData.avatar}
              alt={userData.username}
              width={80}
              height={80}
              className="rounded-full object-cover ring-2 ring-[#323C46]/10"
            />
          </div>
          <h2 className="text-xl font-medium text-[#323C46]">
            Добро пожаловать, {userData.username}!
          </h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setMode("create")}
            className="w-full p-3.5 bg-[#323C46] text-white rounded-xl hover:bg-[#404a56] transition-colors duration-200 font-medium text-sm"
          >
            Создать комнату
          </button>
          <button
            onClick={() => setMode("join")}
            className="w-full p-3.5 bg-white text-[#686B75] border border-[#9197A0] rounded-xl hover:border-[#323C46] transition-colors duration-200 font-medium text-sm"
          >
            Присоединиться к комнате
          </button>
        </div>
      </div>
    </div>
  );
}
