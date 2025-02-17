// components/Editor.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Editor as MonacoEditor, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  useMyPresence,
  useOthers,
  useStorage,
  useMutation,
  useEventListener,
} from "@/liveblocks/client";
import type { Reaction, StorageFile } from "@/types/room";
import { LiveMap } from "@liveblocks/client";
import FileTree from "./FileTree";
import CompilationControl from "./room/CompilationControl";
import { UserSelection, UserCursor } from "./UserSelection";

interface EditorProps {
  username: string;
  roomId: string;
}

const SUPPORTED_LANGUAGES = [
  { id: "typescript", name: "TypeScript", extensions: [".ts", ".tsx"] },
  { id: "javascript", name: "JavaScript", extensions: [".js", ".jsx"] },
  { id: "python", name: "Python", extensions: [".py"] },
  { id: "html", name: "HTML", extensions: [".html", ".htm"] },
  { id: "css", name: "CSS", extensions: [".css"] },
  { id: "json", name: "JSON", extensions: [".json"] },
  { id: "markdown", name: "Markdown", extensions: [".md"] },
];

const COLORS = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ff00ff",
  "#ffff00",
  "#00ffff",
];

export default function Editor({ username }: EditorProps) {
  // Presence and storage hooks
  const [{ selectedFile }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const files = useStorage((root) => root.files);
  const roomSettings = useStorage((root) => root.roomSettings) as {
    isPrivate: boolean;
    enableVoiceChat: boolean;
    enableTextChat: boolean;
    requireVoteForCompilation: boolean;
  };

  // Refs
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor")>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [, setReactions] = useState<Reaction[]>([]);
  const [sidebarWidth] = useState(280);
  const [] = useState<"vs-dark" | "light">("vs-dark");
  const [fontSize] = useState(14);
  const [showMinimap] = useState(false);
  const [] = useState<number | undefined>();

  // Handlers

  // Event listeners
  useEventListener(({ event }) => {
    if (
      event &&
      typeof event === "object" &&
      "type" in event &&
      event.type === "reaction"
    ) {
      const { id, x, y, emoji, timestamp, lineNumber } = event;
      if (
        typeof id === "string" &&
        typeof x === "number" &&
        typeof y === "number" &&
        typeof emoji === "string" &&
        typeof timestamp === "number"
      ) {
        const newReaction: Reaction = {
          id,
          x,
          y,
          emoji,
          username,
          timestamp,
          lineNumber: typeof lineNumber === "number" ? lineNumber : undefined,
        };
        setReactions((prev) => [...prev, newReaction]);
      }
    }
  });

  // Cleanup reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions((reactions) =>
        reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Utility functions
  const getFileLanguage = useCallback((filename: string): string => {
    const ext = filename.split(".").pop() || "";
    const lang = SUPPORTED_LANGUAGES.find((l) =>
      l.extensions.some((e) => e.substring(1) === ext)
    );
    return lang?.id || "plaintext";
  }, []);

  const getFileInfo = useCallback(
    (path: string): StorageFile | null => {
      return files?.get(path) || null;
    },
    [files]
  );

  // Обновляем содержимое редактора при изменениях
  useEffect(() => {
    if (!selectedFile || !files || !editorRef.current) return;

    const currentFile = files.get(selectedFile);
    if (!currentFile) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const currentContent = model.getValue();
    if (currentContent !== currentFile.content) {
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(currentFile.content);
      if (position) {
        editorRef.current.setPosition(position);
      }
    }
  }, [selectedFile, files]);

  // Обработчик изменений в редакторе
  const handleEditorChange = useMutation(
    ({ storage }, value: string) => {
      if (!selectedFile) return;
      const files = storage.get("files") as LiveMap<string, StorageFile>;
      if (!files) return;

      files.set(selectedFile, {
        content: value,
        type: "file",
        language: getFileLanguage(selectedFile),
        lastEditedBy: username,
        lastEditedAt: Date.now(),
      });
    },
    [selectedFile, username, getFileLanguage]
  );

  const handleCursorMove = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!editorContainerRef.current || !editorRef.current) return;

      const rect = editorContainerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      updateMyPresence({
        cursor: {
          x,
          y,
          lineNumber: editorRef.current.getPosition()?.lineNumber || 0,
          column: editorRef.current.getPosition()?.column || 0,
        },
      });
    },
    [updateMyPresence]
  );

  // Также добавим обработчик клика для обновления позиции курсора
  const handleEditorClick = useCallback(
    (event: React.MouseEvent) => {
      handleCursorMove(event);
    },
    [handleCursorMove]
  );

  const handleCursorChange = useCallback(
    (e: editor.ICursorPositionChangedEvent) => {
      if (editorRef.current) {
        const position = e.position;
        if (position) {
          const coordinates =
            editorRef.current.getScrolledVisiblePosition(position);
          updateMyPresence({
            cursor: {
              x: coordinates?.left || 0,
              y: coordinates?.top || 0,
              lineNumber: position.lineNumber,
              column: position.column,
            },
          });
        }
      }
    },
    [updateMyPresence]
  );

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition(handleCursorChange);

    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (selection) {
        updateMyPresence({
          selection: {
            start: selection.startColumn,
            end: selection.endColumn,
            lineNumber: selection.startLineNumber,
          },
        });
      }
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      const disposable =
        editorRef.current.onDidChangeCursorPosition(handleCursorChange);
      return () => {
        disposable.dispose();
      };
    }
  }, [handleCursorChange]);

  return (
    <div className="flex h-screen bg-white text-[#686B75] overflow-hidden">
      {/* Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className="bg-gray-50 border-r border-gray-100 flex flex-col"
      >
        <FileTree
          onSelect={(path) => updateMyPresence({ selectedFile: path })}
          currentFile={selectedFile}
          username={username}
        />
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            {selectedFile && (
              <>
                <span className="text-[#323C46] font-medium">
                  {selectedFile}
                </span>
                {getFileInfo(selectedFile)?.lastEditedBy && (
                  <span className="text-[#9197A0] text-sm">
                    Последнее изменение:{" "}
                    {getFileInfo(selectedFile)?.lastEditedBy}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Editor container */}
        <div
          ref={editorContainerRef}
          className="flex-1 relative"
          onMouseMove={handleCursorMove}
          onClick={handleEditorClick}
          onMouseLeave={() => updateMyPresence({ cursor: null })}
        >
          {selectedFile ? (
            <div className="h-full relative overflow-hidden">
              <MonacoEditor
                height="100%"
                language={getFileLanguage(selectedFile)}
                value={getFileInfo(selectedFile)?.content || ""}
                theme="light"
                onChange={(value) => value && handleEditorChange(value)}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: showMinimap },
                  fontSize,
                  lineNumbers: "on",
                  roundedSelection: false,
                  occurrencesHighlight: "off",
                  cursorStyle: "line",
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "'JetBrains Mono', monospace",
                  // Настройки цветов для светлой темы
                  renderLineHighlight: "all",
                  lineHeight: 1.6,
                }}
                className="px-4"
              />
              <div className="absolute inset-0 pointer-events-none">
                {others.map(({ connectionId, presence, info }) => {
                  if (!presence || !editorRef.current) return null;

                  return (
                    <React.Fragment key={connectionId}>
                      <UserCursor
                        user={{ presence, connectionId, info }}
                        color={COLORS[connectionId % COLORS.length]}
                        selectedFile={selectedFile}
                        editor={editorRef.current}
                      />
                      <UserSelection
                        user={{ presence, connectionId, info }}
                        color={COLORS[connectionId % COLORS.length]}
                        selectedFile={selectedFile}
                        editor={editorRef.current}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-[#323C46] font-medium mb-2">
                Выберите файл для редактирования
              </div>
              <p className="text-[#9197A0] text-sm">
                Выберите файл из списка слева, чтобы начать работу
              </p>
            </div>
          )}
        </div>

        {roomSettings?.requireVoteForCompilation && (
          <div className="fixed bottom-6 left-6">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 
              hover:border-[#323C46] transition-colors duration-200"
            >
              <CompilationControl requireVote={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
