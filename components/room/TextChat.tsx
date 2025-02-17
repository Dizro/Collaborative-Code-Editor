// Компонент текстового чата с real-time синхронизацией через Liveblocks
import React, { useState, useEffect, useRef } from "react";
import { useStorage, useMutation } from "@/liveblocks/client";
import type { ChatMessage } from "@/types/room";
import { nanoid } from "nanoid";
import { LiveMap } from "@liveblocks/client";

export default function TextChat({ username }: { username: string }) {
  // Локальные состояния
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Получаем сообщения из Liveblocks storage
  const chatMessages = useStorage((root) => root.messages);

  // Мутация для добавления сообщения
  const addMessage = useMutation(({ storage }, message: ChatMessage) => {
    const messages = storage.get("messages") as LiveMap<string, ChatMessage>;
    messages.set(message.id, message);
  }, []);

  // Синхронизация сообщений при изменении storage
  useEffect(() => {
    if (chatMessages) {
      const messageArray = Array.from(chatMessages.entries()).map(
        ([, msg]) => msg
      );
      setMessages(messageArray.sort((a, b) => a.timestamp - b.timestamp));
    }
  }, [chatMessages]);

  // Отправка сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: nanoid(),
      userId: "user-" + nanoid(),
      username: username,
      content: newMessage.trim(),
      timestamp: Date.now(),
      type: "text",
      text: "",
    };

    try {
      await addMessage(message);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Автопрокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Форматирование времени
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.type === "system" ? "items-center" : ""
            }`}
          >
            {message.type === "text" && (
              <div
                className={`flex flex-col ${
                  message.username === username ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[85%] ${
                    message.username === username
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      message.username === username
                        ? "bg-[#323C46] text-white"
                        : "bg-gray-50 text-[#393B3A]"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                <div className="mt-1 text-xs text-[#9197A0] px-1">
                  {message.username === username ? "Вы" : message.username} ·{" "}
                  {formatTime(message.timestamp)}
                </div>
              </div>
            )}
            {message.type === "system" && (
              <div className="px-4 py-2 bg-gray-50 rounded-xl text-sm text-[#686B75] text-center">
                {message.content}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      <form
        onSubmit={handleSendMessage}
        className="mt-4 border-t border-gray-100 pt-4"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white text-[#393B3A] rounded-xl border border-[#9197A0] 
             placeholder:text-[#9197A0] focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] 
             transition-colors duration-200 outline-none"
            placeholder="Введите сообщение..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2.5 bg-[#323C46] text-white rounded-xl hover:bg-[#404a56] 
             transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
