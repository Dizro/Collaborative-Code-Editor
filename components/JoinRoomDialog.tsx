"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserData } from "@/types/room";

interface Props {
  userData: UserData;
}

export default function JoinRoomDialog({ userData }: Props) {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      localStorage.setItem("userData", JSON.stringify(userData));
      router.push(`/rooms/${roomId}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px] border border-gray-100">
      <h2 className="text-2xl font-medium text-[#323C46] mb-8">
        Присоединиться к комнате
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-[#686B75] text-sm font-medium mb-2">
            ID комнаты
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Введите ID комнаты"
            className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
              focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
              outline-none placeholder:text-[#9197A0]"
          />
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={!roomId.trim()}
          className="w-full p-3.5 bg-[#323C46] text-white rounded-xl 
            hover:bg-[#404a56] transition-colors duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            font-medium text-sm"
        >
          Присоединиться
        </button>
      </div>
    </div>
  );
}
