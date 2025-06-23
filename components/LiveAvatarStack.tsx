import React from "react";
import { Avatar } from "./Avatar";
import type { User, BaseUserMeta } from "@liveblocks/client";
import type { Presence } from "@/liveblocks.config";

const MAX_DISPLAYED = 3;

interface Info extends BaseUserMeta {
  color?: [string, string];
  avatar?: string;
}

interface Props {
  users: ReadonlyArray<User<Presence, BaseUserMeta>>;
  size?: number;
}

// FIX: Функция-страж для проверки, является ли значение кортежем из двух строк
function isColorTuple(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string"
  );
}

function isUserInfo(info: unknown): info is Info {
    return (
        typeof info === 'object' &&
        info !== null &&
        ('avatar' in info || 'color' in info)
    );
}

export default function LiveAvatarStack({ users, size = 20 }: Props) {
  if (users.length === 0) return null;

  const getRandomGradient = (): [string, string] => {
    const gradients: [string, string][] = [
      ["#FF0099", "#FF7A00"],
      ["#002A95", "#00A0D2"],
      ["#6116FF", "#E32DD1"],
      ["#0EC4D1", "#1BCC00"],
      ["#FF00C3", "#FF3333"],
      ["#00C04D", "#00FFF0"],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="flex -space-x-2 group">
      {users.slice(0, MAX_DISPLAYED).map((user) => {
        const userInfo = isUserInfo(user.info) ? user.info : {};

        // FIX: Используем функцию-страж для безопасного определения цвета
        const avatarColor = isColorTuple(userInfo.color)
          ? userInfo.color
          : getRandomGradient();

        return (
            <div
            key={user.connectionId}
            className="relative"
            title={user.presence.username}
            >
            <Avatar
                src={userInfo.avatar || user.presence.avatar}
                name={user.presence.username}
                size={size}
                color={avatarColor} // Передаем гарантированно правильный тип
                style={{ marginLeft: "-8px" }}
            />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {user.presence.username}
            </div>
            </div>
        );
      })}
      {users.length > MAX_DISPLAYED && (
        <div
          className="relative"
          title={`${users.length - MAX_DISPLAYED} more users`}
        >
          <Avatar
            variant="more"
            size={size}
            count={users.length - MAX_DISPLAYED}
            style={{ marginLeft: "-8px" }}
          />
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {users
              .slice(MAX_DISPLAYED)
              .map((u) => u.presence.username)
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
