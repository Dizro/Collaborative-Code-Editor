// components/UserPresenceBar.tsx
import React from "react";
import type { User, BaseUserMeta } from "@liveblocks/client";
import type { Presence } from "@/liveblocks/client";
import { useUserColors } from "@/hooks/useUserColors";

interface UserPresenceBarProps {
  others: ReadonlyArray<User<Presence, BaseUserMeta>>;
  currentFile: string | null;
}

export default function UserPresenceBar({
  others,
  currentFile,
}: UserPresenceBarProps) {
  const userColors = useUserColors(others);

  // Группируем пользователей по файлам
  const usersByFile = others.reduce((acc, other) => {
    const file = other.presence.selectedFile;
    if (file) {
      if (!acc[file]) {
        acc[file] = [];
      }
      acc[file].push({
        id: other.connectionId,
        username: other.presence.username,
        color: userColors.get(other.connectionId),
        isTyping: other.presence.isTyping,
      });
    }
    return acc;
  }, {} as Record<string, Array<{ id: number; username: string; color: string | undefined; isTyping: boolean }>>);

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-2">
      <div className="flex flex-wrap gap-4">
        {Object.entries(usersByFile).map(([file, users]) => (
          <div
            key={file}
            className={`rounded px-2 py-1 ${
              file === currentFile ? "bg-gray-700" : "bg-gray-800"
            }`}
          >
            <div className="text-xs text-gray-400 mb-1">
              {file.split("/").pop()}
            </div>
            <div className="flex gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1"
                  style={{ color: user.color }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-sm">
                    {user.username}
                    {user.isTyping && (
                      <span className="ml-1 opacity-75">(typing...)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
