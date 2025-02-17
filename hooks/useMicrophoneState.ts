// Хук для управления состоянием микрофона
import { useState, useCallback } from 'react';

export function useMicrophoneState() {
 // Состояние включения/выключения микрофона
 const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);

 // Мемоизированный обработчик переключения
 const toggleMicrophone = useCallback(() => {
   setIsMicrophoneEnabled(prev => !prev);
 }, []);

 return {
   isMicrophoneEnabled,  // Текущее состояние
   toggleMicrophone,     // Функция переключения
 };
}