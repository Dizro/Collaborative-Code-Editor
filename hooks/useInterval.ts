// Хук для создания управляемых интервалов
import { useEffect, useRef } from 'react';

export default function useInterval(callback: () => void, delay: number | null) {
 // Сохраняем callback в ref чтобы сохранить актуальную ссылку
 const savedCallback = useRef(callback);

 // Обновляем ref при изменении callback
 useEffect(() => {
   savedCallback.current = callback;
 }, [callback]);

 // Создаем и очищаем интервал
 useEffect(() => {
   // Запускаем интервал только если delay не null
   if (delay !== null) {
     // Создаем интервал с сохраненным callback
     const id = setInterval(() => savedCallback.current(), delay);
     
     // Очищаем интервал при размонтировании
     return () => clearInterval(id);
   }
 }, [delay]);
}