"use client";

import { useState } from 'react';
import { useStorage } from '@/liveblocks.config';
import { FiDownloadCloud } from 'react-icons/fi';
import JSZip from 'jszip';

export default function DownloadProjectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const files = useStorage(root => root.files);

  const handleDownload = async () => {
    if (!files || files.size === 0) {
      alert("Проект пуст. Нечего скачивать.");
      return;
    }

    setIsLoading(true);

    const zip = new JSZip();

    // Рекурсивная функция для добавления файлов и папок в архив
    const addFilesToZip = (currentZipFolder: JSZip, pathPrefix: string = '') => {
        const entries = new Map<string, {type: 'file' | 'folder', content?: string}>();

        // Собираем все файлы и папки на текущем уровне
        files.forEach((fileData, fullPath) => {
            if (fullPath.startsWith(pathPrefix)) {
                const relativePath = fullPath.substring(pathPrefix.length);
                const parts = relativePath.split('/');

                if (parts.length === 1 && parts[0]) { // Файл или папка в текущей директории
                    if (fileData.type === 'file') {
                        entries.set(parts[0], { type: 'file', content: fileData.content });
                    } else {
                        entries.set(parts[0], { type: 'folder' });
                    }
                }
            }
        });

        // Добавляем в zip
        entries.forEach(({ type, content }, name) => {
            if (type === 'file') {
                currentZipFolder.file(name, content || '');
            } else if (type === 'folder') {
                const newFolder = currentZipFolder.folder(name);
                if (newFolder) {
                    // Рекурсивно добавляем содержимое подпапки
                    addFilesToZip(newFolder, `${pathPrefix}${name}/`);
                }
            }
        });
    };

    addFilesToZip(zip);

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Ошибка при создании ZIP-архива:", error);
      alert("Не удалось создать архив для скачивания.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="p-3 rounded-xl transition-all duration-200 text-foreground-secondary hover:bg-background-secondary hover:text-foreground disabled:cursor-not-allowed"
      title="Скачать проект (ZIP)"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-foreground-secondary border-t-transparent rounded-full animate-spin" />
      ) : (
        <FiDownloadCloud size={20} />
      )}
    </button>
  );
}
