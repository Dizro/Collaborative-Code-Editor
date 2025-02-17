import React, { useState, useCallback, useRef, useEffect } from "react";
import { useStorage, useMutation, useOthers } from "@/liveblocks/client";
import type { StorageFile } from "@/types/room";
import { LiveMap } from "@liveblocks/client";
import {
  FiFolder,
  FiFile,
  FiEdit2,
  FiTrash2,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiFolderPlus,
} from "react-icons/fi";
import LiveAvatarStack from "./LiveAvatarStack";

interface Props {
  onSelect: (path: string | null) => void;
  currentFile: string | null;
  username: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

interface ContextMenuState {
  x: number;
  y: number;
  path: string;
  type: "file" | "directory";
}

// Базовый компонент Modal
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[480px] border border-gray-100">
        <h3 className="text-xl font-medium text-[#323C46] mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// Базовый компонент Input
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return (
    <input
      {...props}
      className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl 
        focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors 
        outline-none placeholder:text-[#9197A0]"
    />
  );
};

// Базовый компонент Button
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline";
  }
> = ({ variant = "primary", className = "", ...props }) => {
  const baseClasses =
    "px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium";
  const variantClasses =
    variant === "primary"
      ? "bg-[#323C46] text-white hover:bg-[#404a56]"
      : "text-[#686B75] hover:text-[#323C46]";

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses} ${className}`}
    />
  );
};

export default function FileTree({ onSelect, currentFile, username }: Props) {
  // Состояния
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const editNameInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Liveblocks хуки
  const files = useStorage((root) => root.files);
  const others = useOthers();

  // Эффекты
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Мутации
  const createFile = useMutation(
    ({ storage }, path: string, content = "") => {
      if (!storage) return;

      const files = storage.get("files") as LiveMap<string, StorageFile>;

      if (files.has(path)) {
        throw new Error("Файл с таким именем уже существует");
      }

      files.set(path, {
        content,
        type: "file",
        language: getFileLanguage(path),
        lastEditedBy: username,
        lastEditedAt: Date.now(),
      });
    },
    [username]
  );

  const createFolder = useMutation(
    ({ storage }, path: string) => {
      if (!storage) return;

      const files = storage.get("files") as LiveMap<string, StorageFile>;

      if (files.has(path)) {
        throw new Error("Папка с таким именем уже существует");
      }

      files.set(path, {
        content: "",
        type: "directory",
        language: "",
        lastEditedBy: username,
        lastEditedAt: Date.now(),
      });
    },
    [username]
  );

  const deleteFile = useMutation(({ storage }, path: string) => {
    if (!storage) return;

    const files = storage.get("files") as LiveMap<string, StorageFile>;

    if (files.get(path)?.type === "directory") {
      Array.from(files.entries()).forEach(([filePath]) => {
        if (filePath.startsWith(path + "/")) {
          files.delete(filePath);
        }
      });
    }

    files.delete(path);
  }, []);

  const renameFile = useMutation(
    ({ storage }, oldPath: string, newPath: string) => {
      if (!storage) return;

      const files = storage.get("files") as LiveMap<string, StorageFile>;
      const file = files.get(oldPath);

      if (!file) return;

      if (files.has(newPath)) {
        throw new Error("Файл с таким именем уже существует");
      }

      if (file.type === "directory") {
        Array.from(files.entries()).forEach(([path, fileData]) => {
          if (path.startsWith(oldPath + "/")) {
            const newFilePath = path.replace(oldPath, newPath);
            files.set(newFilePath, fileData);
            files.delete(path);
          }
        });
      }

      files.set(newPath, { ...file });
      files.delete(oldPath);
    },
    []
  );

  // Построение дерева файлов
  const buildFileTree = useCallback((): TreeNode[] => {
    if (!files) return [];

    const tree: TreeNode[] = [];
    const paths = Array.from(files.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    paths.forEach(([path, file]) => {
      const parts = path.split("/");
      let currentLevel = tree;
      let currentPath = "";

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const existing = currentLevel.find((node) => node.name === part);

        if (!existing) {
          const node: TreeNode = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? file.type : "directory",
          };
          if (node.type === "directory") {
            node.children = [];
          }
          currentLevel.push(node);
          currentLevel = node.children || [];
        } else {
          currentLevel = existing.children || [];
        }
      });
    });

    return tree;
  }, [files]);

  // Обработчики событий
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await createFile(newFileName);
      onSelect(newFileName);
      setNewFileName("");
      setIsNewFileModalOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ошибка при создании файла"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await createFolder(newFolderName);
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
      setExpandedFolders((prev) => new Set([...prev, newFolderName]));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ошибка при создании папки"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPath || !newName.trim()) return;

    const oldPath = editingPath;
    const parentPath = oldPath.split("/").slice(0, -1).join("/");
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    setIsLoading(true);
    setError(null);
    try {
      await renameFile(oldPath, newPath);
      if (currentFile === oldPath) {
        onSelect(newPath);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ошибка при переименовании"
      );
    } finally {
      setIsLoading(false);
      setEditingPath(null);
      setNewName("");
    }
  };

  const handleDelete = async (path: string) => {
    const isDirectory = files?.get(path)?.type === "directory";
    const confirmMessage = isDirectory
      ? "Вы уверены, что хотите удалить эту папку и все её содержимое?"
      : "Вы уверены, что хотите удалить этот файл?";

    if (window.confirm(confirmMessage)) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteFile(path);
        if (currentFile === path) {
          onSelect(null);
        }
      } catch (error) {
        setError("Ошибка при удалении");
      } finally {
        setIsLoading(false);
        setContextMenu(null);
      }
    }
  };

  // Обработчики drag-and-drop
  const handleDragStart = (e: React.DragEvent, path: string) => {
    setDraggedItem(path);
    e.dataTransfer.setData("text/plain", path);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, path: string) => {
    e.preventDefault();
    const file = files?.get(path);
    if (file?.type === "directory" && draggedItem !== path) {
      e.currentTarget.classList.add(
        "ring-2",
        "ring-[#323C46]",
        "ring-opacity-50"
      );
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove(
      "ring-2",
      "ring-[#323C46]",
      "ring-opacity-50"
    );
  };

  const handleDrop = async (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove(
      "ring-2",
      "ring-[#323C46]",
      "ring-opacity-50"
    );

    const sourcePath = draggedItem;
    if (!sourcePath || sourcePath === targetPath) return;

    const targetFile = files?.get(targetPath);
    if (!targetFile || targetFile.type !== "directory") return;

    const fileName = sourcePath.split("/").pop()!;
    const newPath = `${targetPath}/${fileName}`;

    if (sourcePath.startsWith(targetPath + "/")) {
      setError("Нельзя переместить папку в свою подпапку");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await renameFile(sourcePath, newPath);
      if (currentFile === sourcePath) {
        onSelect(newPath);
      }
    } catch (error) {
      setError("Ошибка при перемещении файла");
    } finally {
      setIsLoading(false);
      setDraggedItem(null);
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    path: string,
    type: "file" | "directory"
  ) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 100);
    setContextMenu({ x, y, path, type });
  };

  const startRename = (path: string) => {
    setEditingPath(path);
    setNewName(path.split("/").pop()!);
    setContextMenu(null);
    setTimeout(() => editNameInputRef.current?.focus(), 0);
  };

  // Рендер узла дерева
  const renderNode = (node: TreeNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isEditing = editingPath === node.path;
    const usersInFile = others.filter(
      (user) => user.presence?.selectedFile === node.path
    );
    const isDragging = draggedItem === node.path;

    return (
      <div
        key={node.path}
        style={{ marginLeft: `${level * 16}px` }}
        className={isDragging ? "opacity-50" : ""}
      >
        <div
          className={`flex items-center p-2 rounded-lg cursor-pointer group transition-colors
            ${
              currentFile === node.path
                ? "bg-[#323C46] text-white"
                : "text-[#393B3A] hover:bg-gray-50"
            }`}
          onClick={() => {
            if (node.type === "directory") {
              setExpandedFolders((prev) => {
                const next = new Set(prev);
                if (isExpanded) {
                  next.delete(node.path);
                } else {
                  next.add(node.path);
                }
                return next;
              });
            } else {
              onSelect(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node.path, node.type)}
          draggable={!isEditing}
          onDragStart={(e) => handleDragStart(e, node.path)}
          onDragOver={(e) => handleDragOver(e, node.path)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.path)}
        >
          <span className="mr-1 text-current">
            {node.type === "directory" ? (
              isExpanded ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )
            ) : null}
          </span>
          {node.type === "directory" ? (
            <FiFolder className="mr-2 text-current w-4 h-4" />
          ) : (
            <FiFile className="mr-2 text-current w-4 h-4" />
          )}

          {isEditing ? (
            <form onSubmit={handleRename} className="flex-1">
              <input
                ref={editNameInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white text-[#393B3A] border border-[#9197A0] rounded-lg 
                  px-2 py-1 focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] 
                  transition-colors outline-none"
                onBlur={() => setEditingPath(null)}
                disabled={isLoading}
              />
            </form>
          ) : (
            <span className="flex-1 text-sm">{node.name}</span>
          )}

          {!isEditing && usersInFile.length > 0 && (
            <div className="ml-2">
              <LiveAvatarStack users={usersInFile} />
            </div>
          )}

          {!isEditing && (
            <div
              className={`hidden group-hover:flex space-x-1 ${
                currentFile === node.path ? "text-white" : "text-[#9197A0]"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(node.path);
                }}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                title="Переименовать"
                disabled={isLoading}
              >
                <FiEdit2 size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node.path);
                }}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                title="Удалить"
                disabled={isLoading}
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {node.type === "directory" &&
          isExpanded &&
          node.children?.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  // Основной рендер компонента
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      {files ? (
        <>
          {/* Заголовок */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-[#323C46]">Файлы</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsNewFileModalOpen(true)}
                  className="p-2 text-[#686B75] hover:text-[#323C46] transition-colors rounded-xl 
                    hover:bg-gray-50 flex items-center gap-2"
                  title="Новый файл"
                  disabled={isLoading}
                >
                  <FiPlus size={18} />
                  <span className="text-sm">Файл</span>
                </button>
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="p-2 text-[#686B75] hover:text-[#323C46] transition-colors rounded-xl 
                    hover:bg-gray-50 flex items-center gap-2"
                  title="Новая папка"
                  disabled={isLoading}
                >
                  <FiFolderPlus size={18} />
                  <span className="text-sm">Папка</span>
                </button>
              </div>
            </div>
            <div className="text-sm text-[#9197A0]">
              {others.length + 1} пользователей онлайн
            </div>
          </div>

          {/* Дерево файлов */}
          <div className="flex-1 overflow-auto p-3">
            {buildFileTree().map((node) => renderNode(node))}
          </div>

          {/* Уведомление об ошибке */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Модальное окно создания файла */}
          <Modal
            open={isNewFileModalOpen}
            onClose={() => {
              setNewFileName("");
              setIsNewFileModalOpen(false);
            }}
            title="Создание нового файла"
          >
            <form onSubmit={handleCreateFile} className="space-y-6">
              <div>
                <label className="block text-[#686B75] text-sm font-medium mb-2">
                  Имя файла
                </label>
                <Input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.ext"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-[#686B75] text-sm font-medium mb-2">
                  Выберите расширение
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[".ts", ".js", ".tsx", ".jsx", ".css", ".json", ".md"].map(
                    (ext) => (
                      <button
                        key={ext}
                        type="button"
                        onClick={() =>
                          setNewFileName((prev) => {
                            const baseName = prev.split(".")[0] || "new-file";
                            return `${baseName}${ext}`;
                          })
                        }
                        className="p-2.5 text-[#686B75] border border-[#9197A0] rounded-xl 
                          hover:border-[#323C46] hover:text-[#323C46] transition-colors text-sm
                          focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46]"
                        disabled={isLoading}
                      >
                        {ext}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewFileName("");
                    setIsNewFileModalOpen(false);
                  }}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={!newFileName.trim() || isLoading}
                >
                  Создать
                </Button>
              </div>
            </form>
          </Modal>

          {/* Модальное окно создания папки */}
          <Modal
            open={isNewFolderModalOpen}
            onClose={() => {
              setNewFolderName("");
              setIsNewFolderModalOpen(false);
            }}
            title="Создание новой папки"
          >
            <form onSubmit={handleCreateFolder} className="space-y-6">
              <div>
                <label className="block text-[#686B75] text-sm font-medium mb-2">
                  Имя папки
                </label>
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="new-folder"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewFolderName("");
                    setIsNewFolderModalOpen(false);
                  }}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={!newFolderName.trim() || isLoading}
                >
                  Создать
                </Button>
              </div>
            </form>
          </Modal>

          {/* Контекстное меню */}
          {contextMenu && (
            <div
              ref={contextMenuRef}
              className="fixed bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button
                className="w-full px-4 py-2 text-left text-[#393B3A] hover:bg-gray-50 
                  transition-colors flex items-center space-x-2"
                onClick={() => startRename(contextMenu.path)}
                disabled={isLoading}
              >
                <FiEdit2 size={14} />
                <span>Переименовать</span>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-[#393B3A] hover:bg-gray-50 
                  transition-colors flex items-center space-x-2"
                onClick={() => handleDelete(contextMenu.path)}
                disabled={isLoading}
              >
                <FiTrash2 size={14} />
                <span>Удалить</span>
              </button>
            </div>
          )}
        </>
      ) : (
        // Состояние загрузки
        <div className="flex items-center justify-center h-full">
          <div className="text-[#686B75]">Загрузка...</div>
        </div>
      )}
    </div>
  );
}

function getFileLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
  };
  return languageMap[ext] || "plaintext";
}
