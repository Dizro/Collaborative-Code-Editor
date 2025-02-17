"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserData } from "@/types/room";

interface Props {
  userData: UserData;
}

interface RoomSettings {
  roomName: string;
  maxUsers: number;
  enableFileTree: boolean;
  authMethod: "anonymous" | "google" | "email" | "all";
  chatSettings: {
    enableTextChat: boolean;
    enableVoiceChat: boolean;
  };
}

export default function CreateRoomDialog({}: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>({
    roomName: "",
    maxUsers: 10,
    enableFileTree: true,
    authMethod: "all",
    chatSettings: {
      enableTextChat: true,
      enableVoiceChat: true,
    },
  });

  const handleCreateRoom = async () => {
    const roomId = `room-${Date.now()}`;
    router.push(
      `/rooms/${roomId}?settings=${encodeURIComponent(
        JSON.stringify(settings)
      )}`
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-[520px] border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-[#323C46] mb-2">
          Создание комнаты
        </h2>
        <p className="text-[#686B75]">
          Настройте параметры комнаты для совместной работы
        </p>
      </div>

      <div className="space-y-8">
        {/* Основные настройки */}
        <div className="space-y-4">
          <div>
            <label className="block text-[#686B75] text-sm font-medium mb-2">
              Название комнаты
            </label>
            <input
              type="text"
              value={settings.roomName}
              onChange={(e) =>
                setSettings({ ...settings, roomName: e.target.value })
              }
              className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
                focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
                outline-none placeholder:text-[#9197A0]"
              placeholder="Введите название комнаты"
            />
          </div>

          <div>
            <label className="block text-[#686B75] text-sm font-medium mb-2">
              Максимум участников
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxUsers}
              onChange={(e) =>
                setSettings({ ...settings, maxUsers: parseInt(e.target.value) })
              }
              className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
                focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
                outline-none"
            />
            <p className="mt-2 text-sm text-[#9197A0]">
              Рекомендуемое количество: 2-10 человек
            </p>
          </div>
        </div>

        {/* Настройки доступа */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#323C46] mb-4">
            Настройки доступа
          </h3>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableFileTree}
                onChange={(e) =>
                  setSettings({ ...settings, enableFileTree: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
              />
              <div>
                <span className="block text-[#393B3A] font-medium">
                  Файловое дерево
                </span>
                <span className="block text-sm text-[#9197A0] mt-1">
                  Показывать структуру файлов проекта
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-[#686B75] text-sm font-medium mb-2">
              Метод авторизации
            </label>
            <select
              value={settings.authMethod}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  authMethod: e.target.value as RoomSettings["authMethod"],
                })
              }
              className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
                focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
                outline-none appearance-none cursor-pointer"
            >
              <option value="all">Все методы</option>
              <option value="anonymous">Только анонимно</option>
              <option value="google">Только Google</option>
              <option value="email">Только Email</option>
            </select>
          </div>
        </div>

        {/* Настройки коммуникации */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#323C46] mb-4">
            Настройки общения
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.chatSettings.enableTextChat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatSettings: {
                        ...settings.chatSettings,
                        enableTextChat: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
                />
                <div>
                  <span className="block text-[#393B3A] font-medium">
                    Текстовый чат
                  </span>
                  <span className="block text-sm text-[#9197A0] mt-1">
                    Общение через сообщения
                  </span>
                </div>
              </label>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.chatSettings.enableVoiceChat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatSettings: {
                        ...settings.chatSettings,
                        enableVoiceChat: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
                />
                <div>
                  <span className="block text-[#393B3A] font-medium">
                    Голосовой чат
                  </span>
                  <span className="block text-sm text-[#9197A0] mt-1">
                    Общение через микрофон
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={!settings.roomName}
          className="w-full p-3.5 bg-[#323C46] text-white rounded-xl 
            hover:bg-[#404a56] transition-colors duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            font-medium text-sm"
        >
          Создать комнату
        </button>
      </div>
    </div>
  );
}
