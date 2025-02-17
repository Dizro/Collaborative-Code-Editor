// Компонент для приглашения пользователей в комнату через ссылку
import React, { useState, useEffect } from "react";

// Пропсы компонента
interface RoomInviteProps {
  roomId: string; // ID комнаты
  isPrivate: boolean; // Флаг приватности
}

export default function RoomInvite({ roomId, isPrivate }: RoomInviteProps) {
  // Состояния компонента
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Генерация ссылки при изменении ID комнаты
  useEffect(() => {
    setInviteLink(`${window.location.origin}/rooms/${roomId}`);
  }, [roomId]);

  // Копирование ссылки в буфер обмена
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <p className="text-[#686B75] text-sm mb-6">
        Поделитесь ссылкой для присоединения к комнате
      </p>

      <div className="space-y-4">
        {/* Поле со ссылкой */}
        <div className="w-full relative">
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
             focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors 
             duration-200 outline-none cursor-text select-all font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Кнопка копирования */}
        <button
          onClick={copyToClipboard}
          className="w-full px-4 py-3 bg-[#323C46] text-white font-medium rounded-xl 
           hover:bg-[#404a56] transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-[#323C46] focus:ring-offset-2
           flex items-center justify-center space-x-2"
        >
          {copied ? (
            // Состояние после копирования
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Скопировано</span>
            </>
          ) : (
            // Начальное состояние
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              <span>Копировать ссылку</span>
            </>
          )}
        </button>
      </div>

      {/* Уведомление для приватной комнаты */}
      {isPrivate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-[#323C46] mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-[#393B3A] font-medium">Приватная комната</p>
              <p className="text-sm text-[#686B75] mt-1">
                Присоединиться смогут только приглашенные пользователи
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
