import React, { useState } from "react";
import { useRouter } from "next/router";
import { nanoid } from "nanoid";
import type { RoomSettings } from "@/types/room";

interface CreateRoomProps {
  onSubmit: (settings: RoomSettings, roomId: string) => void;
}

export default function CreateRoom({ onSubmit }: CreateRoomProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>({
    isPrivate: false,
    requireVoteForCompilation: false,
    enableVoiceChat: true,
    enableTextChat: true,
    allowedUsers: [],
    roomName: "",
    description: "",
    maxUsers: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomId = nanoid();

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings, roomId }),
      });

      if (response.ok) {
        onSubmit(settings, roomId);
        router.push(`/rooms/${roomId}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-[#323C46] mb-2">
          Создание комнаты
        </h2>
        <p className="text-[#686B75]">
          Настройте параметры вашей комнаты для совместной работы
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Основная информация */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="room-name"
              className="block text-[#686B75] text-sm font-medium mb-2"
            >
              Название комнаты
            </label>
            <input
              id="room-name"
              name="roomName"
              type="text"
              required
              className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
                focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
                outline-none placeholder:text-[#9197A0]"
              placeholder="Введите название комнаты"
              value={settings.roomName}
              onChange={(e) =>
                setSettings({ ...settings, roomName: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-[#686B75] text-sm font-medium mb-2"
            >
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
                focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
                outline-none placeholder:text-[#9197A0] resize-none"
              placeholder="Опишите назначение комнаты"
              value={settings.description}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* Настройки доступа */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-[#323C46]">
            Настройки доступа
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
                  checked={settings.isPrivate}
                  onChange={(e) =>
                    setSettings({ ...settings, isPrivate: e.target.checked })
                  }
                />
                <div>
                  <span className="block text-[#393B3A] font-medium">
                    Приватная комната
                  </span>
                  <span className="block text-sm text-[#9197A0] mt-1">
                    Только приглашенные пользователи смогут присоединиться
                  </span>
                </div>
              </label>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
                  checked={settings.requireVoteForCompilation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requireVoteForCompilation: e.target.checked,
                    })
                  }
                />
                <div>
                  <span className="block text-[#393B3A] font-medium">
                    Голосование для компиляции
                  </span>
                  <span className="block text-sm text-[#9197A0] mt-1">
                    Требуется согласие участников для запуска кода
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Настройки коммуникации */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-[#323C46]">
            Настройки коммуникации
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
                  checked={settings.enableVoiceChat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableVoiceChat: e.target.checked,
                    })
                  }
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

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#323C46] transition-colors duration-200 cursor-pointer">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#323C46] focus:ring-[#323C46]"
                  checked={settings.enableTextChat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableTextChat: e.target.checked,
                    })
                  }
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
          </div>
        </div>

        {/* Количество участников */}
        <div>
          <label className="block text-[#686B75] text-sm font-medium mb-2">
            Максимальное количество участников
          </label>
          <input
            type="number"
            min="1"
            max="50"
            className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
              focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 
              outline-none"
            value={settings.maxUsers}
            onChange={(e) =>
              setSettings({
                ...settings,
                maxUsers: parseInt(e.target.value) || 10,
              })
            }
          />
          <p className="mt-2 text-sm text-[#9197A0]">
            Рекомендуемое количество: 2-10 человек
          </p>
        </div>

        {/* Кнопка создания */}
        <button
          type="submit"
          className="w-full p-3.5 bg-[#323C46] text-white rounded-xl 
            hover:bg-[#404a56] transition-colors duration-200 
            font-medium text-sm"
        >
          Создать комнату
        </button>
      </form>
    </div>
  );
}
