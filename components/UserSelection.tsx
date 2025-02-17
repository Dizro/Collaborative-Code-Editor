import React from "react";
import { Presence } from "@/liveblocks/client";
import { editor as monacoEditor } from "monaco-editor";

interface Props {
  user: {
    presence: Presence;
    connectionId: number;
    info?: unknown;
    id?: string;
    canWrite?: boolean;
    canComment?: boolean;
  };
  color: string;
  selectedFile: string;
  editor: monacoEditor.IStandaloneCodeEditor | null;
}

export function UserSelection({ user, color, selectedFile, editor }: Props) {
  if (
    !user.presence.selection ||
    user.presence.selectedFile !== selectedFile ||
    !editor
  ) {
    return null;
  }

  const position = {
    lineNumber: user.presence.selection.lineNumber,
    column: user.presence.selection.start,
  };

  const coordinates = editor.getScrolledVisiblePosition(position);
  if (!coordinates) return null;

  const lineHeight =
    editor.getOption(monacoEditor.EditorOption.lineHeight) || 20;
  const fontInfo = editor.getOption(
    monacoEditor.EditorOption.fontInfo
  ) as monacoEditor.FontInfo;
  const charWidth = fontInfo?.typicalFullwidthCharacterWidth || 8;

  return (
    <div
      style={{
        position: "absolute",
        top: `${coordinates.top}px`,
        left: `${coordinates.left}px`,
        width: `${
          (user.presence.selection.end - user.presence.selection.start) *
          charWidth
        }px`,
        height: `${lineHeight}px`,
        backgroundColor: `${color}33`,
        border: `1px solid ${color}`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          backgroundColor: color,
          color: "white",
          padding: "2px 4px",
          borderRadius: "2px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {user.presence.username}
      </div>
    </div>
  );
}

export function UserCursor({ user, color, selectedFile, editor }: Props) {
  if (
    !user.presence.cursor ||
    user.presence.selectedFile !== selectedFile ||
    !editor
  ) {
    return null;
  }

  // Получаем позицию из Monaco Editor
  const position = {
    lineNumber: user.presence.cursor.lineNumber || 1,
    column: user.presence.cursor.column || 1,
  };

  // Конвертируем позицию в координаты
  const coordinates = editor.getScrolledVisiblePosition(position);

  if (!coordinates) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: `${coordinates.top}px`,
        left: `${coordinates.left}px`,
        width: "2px",
        height: "18px",
        backgroundColor: color,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "0",
          backgroundColor: color,
          color: "white",
          padding: "2px 4px",
          borderRadius: "2px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {user.presence.username}
      </div>
    </div>
  );
}
