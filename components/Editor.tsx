import React, { useEffect, useRef, useCallback, useState } from "react";
import { Editor as MonacoEditor, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  useMyPresence,
  useOthers,
  useStorage,
  useMutation,
} from "@/liveblocks.config";
import type { StorageFile } from "@/types/room";
import { LiveMap } from "@liveblocks/client";
import FileTree from "./FileTree";
import UserCursor from "./UserCursor";
import { useTheme } from "@/contexts/ThemeContext";
import AIAssistant from "./AIAssistant";
import { useUserColors } from "@/hooks/useUserColors";
import { debounce } from 'lodash';
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface EditorProps {
  username: string;
  roomId: string;
}

const getFileLanguage = (filename: string | null): string => {
    if (!filename) return 'plaintext';
    const ext = filename.split(".").pop() || "";
    const langMap: Record<string, string> = {
        ts: "typescript", tsx: "typescript",
        js: "javascript", jsx: "javascript",
        py: "python", html: "html", css: "css",
        json: "json", md: "markdown",
    };
    return langMap[ext] || "plaintext";
};

export default function Editor({ username, roomId }: EditorProps) {
  const [{ selectedFile }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const files = useStorage(root => root.files);
  const { theme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Состояние для мобильного сайдбара

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isApplyingRemoteChange = useRef(false);

  const userColors = useUserColors(others);

  const currentFileContent = selectedFile ? files?.get(selectedFile)?.content : null;

  const handleEditorChange = useMutation(
    ({ storage }, value: string) => {
      if (isApplyingRemoteChange.current) return;

      updateMyPresence({ isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => updateMyPresence({ isTyping: false }), 1000);

      if (!selectedFile) return;
      const currentFiles = storage.get("files") as LiveMap<string, StorageFile>;
      const file = currentFiles.get(selectedFile);
      if (file) {
        currentFiles.set(selectedFile, { ...file, content: value, lastEditedBy: username, lastEditedAt: Date.now() });
      }
    },
    [selectedFile, username, updateMyPresence]
  );

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition(e => {
        const position = e.position;
        updateMyPresence({
            cursor: {
                lineNumber: position.lineNumber,
                column: position.column,
            }
        });
    });

    editor.onDidChangeCursorSelection(e => {
        const selection = e.selection;
        updateMyPresence({
            selection: {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn,
            }
        });
    });

    const editorElement = editor.getDomNode();
    if (editorElement) {
        editorElement.addEventListener('mouseleave', () => {
            updateMyPresence({ cursor: null });
        });
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || currentFileContent === null || currentFileContent === undefined) return;

    const model = editor.getModel();
    if (model && model.getValue() !== currentFileContent) {
        isApplyingRemoteChange.current = true;
        const currentPosition = editor.getPosition();
        editor.executeEdits("liveblocks-sync", [{
            range: model.getFullModelRange(),
            text: currentFileContent
        }]);
        if (currentPosition) editor.setPosition(currentPosition);
        isApplyingRemoteChange.current = false;
    }
  }, [currentFileContent]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations: editor.IModelDeltaDecoration[] = [];

    others.forEach(user => {
      const userColor = userColors.get(user.connectionId);
      if (user.presence?.selection && user.presence.selectedFile === selectedFile && userColor) {
        const selection = user.presence.selection;
        const isSelectionEmpty =
            selection.startLineNumber === selection.endLineNumber &&
            selection.startColumn === selection.endColumn;

        const selectionClassName = `user-selection user-selection-color-${user.connectionId}`;
        newDecorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: selectionClassName,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        });

        if (!isSelectionEmpty) {
            const nameTagClassName = `user-nametag user-nametag-color-${user.connectionId}`;
            newDecorations.push({
                range: new monaco.Range(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn),
                options: {
                    after: { content: `\u200B${user.presence.username}` },
                    className: nameTagClassName,
                }
            });
        }
      }
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

  }, [others, selectedFile, userColors]);

  useEffect(() => {
    const styleId = 'dynamic-user-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }

    let newCssRules = '';
    userColors.forEach((color, connectionId) => {
        newCssRules += `
          .user-selection-color-${connectionId} { background-color: ${color}33; }
          .user-nametag-color-${connectionId}::after {
            background-color: ${color};
            color: white;
            padding: 1px 4px;
            border-radius: 3px;
            margin-left: 6px;
            font-size: 12px;
          }
        `;
    });
    styleElement.innerHTML = newCssRules;
  }, [userColors]);

  const monacoTheme = theme === 'light' ? 'vs' : (theme === 'dark' ? 'vs-dark' : 'ocean-theme');

  useEffect(() => {
    const monaco = monacoRef.current;
    if (monaco) {
        monaco.editor.defineTheme('ocean-theme', {
            base: 'vs-dark', inherit: true, rules: [],
            colors: {
                'editor.background': '#0F172A', 'editor.foreground': '#E2E8F0',
                'editorCursor.foreground': '#38BDF8', 'editor.lineHighlightBackground': '#1E293B',
                'editorLineNumber.foreground': '#475569', 'editor.selectionBackground': '#334155',
            },
        });
    }
  }, [monacoRef.current]);

  return (
    <div className="flex h-full bg-background text-foreground-secondary overflow-hidden">
      {/* --- Мобильный сайдбар --- */}
      <AnimatePresence>
        {isSidebarOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 h-full w-72 z-50 lg:hidden"
                >
                    <FileTree onSelect={(path) => { updateMyPresence({ selectedFile: path, selection: null, cursor: null }); setIsSidebarOpen(false); }} currentFile={selectedFile} username={username} />
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* --- Десктопный сайдбар --- */}
      <div className="hidden lg:block w-72 bg-background-secondary border-r border-border flex-shrink-0">
        <FileTree onSelect={(path) => updateMyPresence({ selectedFile: path, selection: null, cursor: null })} currentFile={selectedFile} username={username} />
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-foreground-secondary hover:bg-background-secondary rounded-md lg:hidden">
                <FiMenu size={20} />
            </button>
            {selectedFile && (
              <>
                <span className="text-foreground font-medium">{selectedFile}</span>
                <span className="text-foreground-secondary text-sm hidden sm:inline">
                  {others.some(u => u.presence.selectedFile === selectedFile && u.presence.isTyping) ? 'печатает...' : ''}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 relative">
          {selectedFile ? (
            <>
              <MonacoEditor
                key={selectedFile}
                height="100%"
                language={getFileLanguage(selectedFile)}
                value={currentFileContent || ""}
                theme={monacoTheme}
                onChange={(value) => handleEditorChange(value || "")}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false }, fontSize: 14, lineNumbers: "on",
                  roundedSelection: false, scrollBeyondLastLine: false, automaticLayout: true,
                  tabSize: 2, wordWrap: "on", cursorSmoothCaretAnimation: "on",
                  padding: { top: 16, bottom: 16 }, fontFamily: "JetBrains Mono, monospace",
                }}
              />
              <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
                {others
                  .filter(other => other.presence.cursor && other.presence.selectedFile === selectedFile && editorRef.current)
                  .map(({ connectionId, presence }) => {
                    const coords = editorRef.current!.getScrolledVisiblePosition(presence.cursor!);
                    if (!coords) return null;

                    return (
                        <UserCursor
                        key={connectionId}
                        x={coords.left}
                        y={coords.top}
                        username={presence.username}
                        color={userColors.get(connectionId) || "#000000"}
                        />
                    );
                  })}
              </div>
              <AIAssistant code={currentFileContent || ""} fileName={selectedFile} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-foreground font-medium mb-2">Выберите или создайте файл</div>
              <p className="text-foreground-secondary text-sm">Используйте панель слева, чтобы начать работу.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
