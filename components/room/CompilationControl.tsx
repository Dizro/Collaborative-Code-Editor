// Импортируем нужные хуки из Liveblocks и React
import React, { useState } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useOthers,
} from "@/liveblocks/client";

// Интерфейс для пропсов компонента
interface CompilationControlProps {
  requireVote: boolean;
}

// Типы событий компиляции
type CompilationEvent = {
  type: "compilation-request" | "compilation-vote" | "compilation-result";
  userId?: string;
  vote?: boolean;
  result?: {
    output: string;
    error?: string;
    status: number;
  };
};

// Компонент управления компиляцией кода
export default function CompilationControl({
  requireVote,
}: CompilationControlProps) {
  // Состояния компонента
  const [isCompiling, setIsCompiling] = useState(false);
  const [votes, setVotes] = useState(new Map<string, boolean>());

  // Хуки Liveblocks
  const others = useOthers();
  const broadcast = useBroadcastEvent();

  // Подсчет голосов
  const totalUsers = others.length + 1;
  const requiredVotes = Math.ceil(totalUsers / 2);
  const currentVotes = Array.from(votes.values()).filter(Boolean).length;

  // Обработчик нажатия на кнопку компиляции
  const handleCompile = async () => {
    if (requireVote) {
      broadcast({ type: "compilation-request" });
      const newVotes = new Map(votes);
      newVotes.set("current-user", true);
      setVotes(newVotes);
    } else {
      await compileCode();
    }
  };

  // Функция компиляции кода
  const compileCode = async () => {
    setIsCompiling(true);
    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "code-content", // TODO: Добавить реальный код
          language: "language", // TODO: Добавить реальный язык
        }),
      });

      if (response.ok) {
        const result = await response.json();
        broadcast({ type: "compilation-result", result });
      }
    } catch (error) {
      console.error("Compilation failed:", error);
    } finally {
      setIsCompiling(false);
      setVotes(new Map());
    }
  };

  // Слушатель событий компиляции
  useEventListener(({ event }) => {
    if (!event) return;

    const e = event as CompilationEvent;
    if (e.type === "compilation-request") {
      // TODO: Показать диалог голосования
    } else if (
      e.type === "compilation-vote" &&
      e.userId &&
      e.vote !== undefined
    ) {
      const newVotes = new Map(votes);
      newVotes.set(e.userId, e.vote);
      setVotes(newVotes);

      if (
        Array.from(newVotes.values()).filter(Boolean).length >= requiredVotes
      ) {
        compileCode();
      }
    } else if (e.type === "compilation-result") {
      // TODO: Показать результат компиляции
    }
  });

  // Рендер компонента
  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 p-4 rounded-lg shadow-lg">
      <button
        onClick={handleCompile}
        disabled={isCompiling}
        className={`px-4 py-2 rounded ${
          isCompiling
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        } text-white transition-colors`}
      >
        {isCompiling ? "Compiling..." : "Compile Code"}
      </button>

      {requireVote && (
        <div className="mt-2">
          <div className="text-sm text-gray-300">
            Votes: {currentVotes}/{requiredVotes}
          </div>
          <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width: `${(currentVotes / requiredVotes) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
