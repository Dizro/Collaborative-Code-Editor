"use client";

import { useState } from 'react';
import { FiCpu, FiLoader, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  code: string;
  fileName: string;
}

export default function AIAssistant({ code, fileName }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code) {
        setError("Нет кода для анализа.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setIsOpen(true);

    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Ошибка при анализе кода');
      }

      const data = await response.json();
      setAnalysis(data.analysis);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleAnalyze} disabled={isLoading} className="fixed bottom-6 right-6 z-10 flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-110" title="Анализировать код с помощью ИИ">
        {isLoading ? <FiLoader className="animate-spin" /> : <FiCpu />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Анализ файла: {fileName}</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-foreground-secondary hover:bg-background-secondary rounded-xl">
                <FiX />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto prose prose-sm max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-blockquote:text-foreground-secondary prose-code:text-primary">
              {isLoading && <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-primary" /></div>}
              {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>}
              {analysis && <ReactMarkdown>{analysis}</ReactMarkdown>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
