// Компонент голосового чата с определением активности микрофона
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useMyPresence, useOthers } from "@/liveblocks/client";
import { useMicrophoneState } from "@/hooks/useMicrophoneState";

export default function VoiceChat() {
  // Стейты и хуки
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const { isMicrophoneEnabled, toggleMicrophone } = useMicrophoneState();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Инициализация Web Audio API
  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const context = new AudioContextClass();
    setAudioContext(context);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      context.close();
    };
  }, []);

  // Настройка аудио потока с микрофона
  const setupAudioStream = useCallback(async () => {
    if (!audioContext) return;

    try {
      // Получаем поток с микрофона
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2,
          sampleRate: 48000,
        },
      });

      // Настраиваем аудио ноды
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      gainNode.gain.value = 1.0;

      // Подключаем ноды
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      analyserRef.current = analyser;
      setMediaStream(stream);

      // Анализ уровня звука
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 128) * 100);

        setAudioLevel(normalizedLevel);
        updateMyPresence({ isSpeaking: normalizedLevel > 15 });

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [audioContext, updateMyPresence]);

  // Управление состоянием микрофона
  useEffect(() => {
    if (isMicrophoneEnabled && !mediaStream) {
      setupAudioStream();
    } else if (!isMicrophoneEnabled && mediaStream) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setAudioLevel(0);
      updateMyPresence({ isSpeaking: false });
    }
  }, [isMicrophoneEnabled, mediaStream, setupAudioStream, updateMyPresence]);

  return (
    <div className="flex flex-col h-full">
      {/* Контроль микрофона */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#686B75] text-sm">
            {isMicrophoneEnabled ? "Микрофон включен" : "Микрофон выключен"}
          </p>
        </div>

        <button
          onClick={toggleMicrophone}
          className={`p-3 rounded-xl transition-colors duration-200 ${
            isMicrophoneEnabled
              ? "bg-[#323C46] hover:bg-[#404a56]"
              : "bg-white border border-[#9197A0] hover:border-[#323C46]"
          }`}
        >
          {/* Иконки микрофона */}
          {isMicrophoneEnabled ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-[#686B75]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Индикатор уровня звука */}
      {isMicrophoneEnabled && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#686B75]">
              Уровень громкости
            </span>
            <span className="text-sm text-[#9197A0]">
              {Math.round(audioLevel)}%
            </span>
          </div>
          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#323C46] transition-all duration-75"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Список участников */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#686B75]">
            Участники ({others.length})
          </h4>

          <div className="space-y-2">
            {others.map((user) => (
              <div
                key={user.connectionId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.presence.isSpeaking
                        ? "bg-[#323C46] animate-pulse"
                        : "bg-[#9197A0]"
                    }`}
                  />
                  <span className="text-[#393B3A] font-medium">
                    {user.presence.username}
                  </span>
                </div>

                {user.presence.isSpeaking && (
                  <svg
                    className="w-4 h-4 text-[#323C46]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
