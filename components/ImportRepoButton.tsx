"use client";

import { useState } from 'react';
import { useMutation } from '@/liveblocks.config';
import { FiGithub, FiLoader } from 'react-icons/fi';
import JSZip from 'jszip';
import { LiveMap } from '@liveblocks/client';
import type { StorageFile } from '@/types/room';

// Сервис для скачивания GitHub репозиториев как ZIP
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const getRepoZipUrl = (repoUrl: string) => {
  try {
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length < 2) return null;
    const [owner, repo] = pathParts;
    // Пытаемся найти основную ветку (main, master)
    // Для простоты пока используем main, но в идеале нужно определять ветку по умолчанию
    return `${PROXY_URL}https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
  } catch (e) {
    return null;
  }
};

export default function ImportRepoButton({ username }: { username: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importFiles = useMutation(
    ({ storage }, filesToImport: Map<string, string>) => {
      const files = storage.get("files") as LiveMap<string, StorageFile>;

      // FIX: Правильный способ очистки LiveMap внутри мутации
      const keysToDelete: string[] = [];
      files.forEach((_, key) => {
        keysToDelete.push(key);
      });
      keysToDelete.forEach(key => {
        files.delete(key);
      });

      // Добавляем новые файлы
      filesToImport.forEach((content, path) => {
        files.set(path, {
          content,
          type: 'file',
          language: getFileLanguage(path),
          lastEditedBy: username,
          lastEditedAt: Date.now(),
        });
      });
    },
    [username]
  );

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    const zipUrl = getRepoZipUrl(repoUrl);
    if (!zipUrl) {
      setError("Неверный URL репозитория GitHub. Убедитесь, что он имеет вид https://github.com/user/repo");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(zipUrl);
      if (!response.ok) {
        // Попробуем ветку master, если main не найдена
        const masterZipUrl = zipUrl.replace('/main.zip', '/master.zip');
        const masterResponse = await fetch(masterZipUrl);
        if (!masterResponse.ok) {
            throw new Error(`Не удалось скачать репозиторий. Проверены ветки main и master. Статус: ${masterResponse.status}`);
        }
        const blob = await masterResponse.blob();
        await processZip(blob);
      } else {
        const blob = await response.blob();
        await processZip(blob);
      }

    } catch (err: any) {
      setError(err.message || "Произошла неизвестная ошибка.");
      console.error("Ошибка импорта:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const processZip = async (blob: Blob) => {
    const zip = await JSZip.loadAsync(blob);

    const filesToImport = new Map<string, string>();
    const promises: Promise<void>[] = [];

    const ignoredPatterns = [
      '.git/', 'node_modules/', '.vscode/', '.idea/',
      'package-lock.json', 'yarn.lock',
      '.DS_Store',
    ];
    const ignoredExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.eot', '.ttf', '.woff', '.woff2'];

    zip.forEach((relativePath, zipEntry) => {
      const cleanedPath = relativePath.substring(relativePath.indexOf('/') + 1);

      if (
        !zipEntry.dir &&
        cleanedPath &&
        !ignoredPatterns.some(p => cleanedPath.startsWith(p)) &&
        !ignoredExtensions.some(ext => cleanedPath.endsWith(ext))
      ) {
        const promise = zipEntry.async('string').then(content => {
          filesToImport.set(cleanedPath, content);
        });
        promises.push(promise);
      }
    });

    await Promise.all(promises);

    if (filesToImport.size === 0) {
      throw new Error("В репозитории не найдено подходящих для импорта файлов.");
    }

    importFiles(filesToImport);
    setIsOpen(false);
    setRepoUrl('');
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-xl transition-all duration-200 text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
        title="Импортировать из GitHub"
      >
        <FiGithub size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-6 rounded-2xl shadow-lg w-full max-w-md border border-border">
            <h3 className="text-xl font-medium text-foreground mb-2">Импорт из GitHub</h3>
            <p className="text-foreground-secondary mb-6 text-sm">Вставьте ссылку на публичный репозиторий. Все текущие файлы будут заменены.</p>

            <form onSubmit={handleImport} className="space-y-4">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full p-3 bg-background text-foreground border border-border rounded-xl
                  focus:border-primary focus:ring-1 focus:ring-primary transition-colors
                  outline-none placeholder:text-foreground-secondary"
                disabled={isLoading}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 rounded-xl text-foreground-secondary hover:bg-background-secondary" disabled={isLoading}>
                  Отмена
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2" disabled={isLoading || !repoUrl.trim()}>
                  {isLoading ? <FiLoader className="animate-spin" /> : <FiGithub />}
                  Импорт
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function getFileLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "javascript", ts: "typescript", jsx: "javascript", tsx: "typescript",
    py: "python", html: "html", css: "css", json: "json", md: "markdown",
  };
  return languageMap[ext] || "plaintext";
}
