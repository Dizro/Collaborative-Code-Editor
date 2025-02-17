import React from "react";
import { useOthers } from "@/liveblocks/client";
import { Avatar } from "./Avatar";

const MAX_AVATARS = 3; // TODO Проверить оптимальное количество

export default function FileUsers({ file }: { file: string }) {
  const others = useOthers();
  const usersInFile = others.filter(
    (user) => user.presence.selectedFile === file
  );

  if (usersInFile.length === 0) return null;

  return (
    <div className="flex -space-x-2 ml-2">
      {usersInFile.slice(0, MAX_AVATARS).map((user, index) => (
        <Avatar
          key={user.connectionId}
          size={20}
          name={user.presence.username}
          src={user.presence.avatar}
          color={["#FF0000", "#FF0000"]}
          style={{ marginLeft: index > 0 ? "-8px" : "0" }}
        />
      ))}
      {usersInFile.length > MAX_AVATARS && (
        <Avatar
          variant="more"
          size={20}
          count={usersInFile.length - MAX_AVATARS}
          style={{ marginLeft: "-8px" }}
        />
      )}
    </div>
  );
} 