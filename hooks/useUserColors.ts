// Хук для управления цветами пользователей
import { useMemo } from 'react';
import type { User, BaseUserMeta } from '@liveblocks/client';
import type { Presence } from '@/liveblocks.config';

// Набор предопределенных цветов для пользователей
const COLORS = [
 "#FF0000", // Красный
 "#4CAF50", // Зеленый
 "#2196F3", // Синий
 "#FFC107", // Желтый
 "#9C27B0", // Пурпурный
 "#00BCD4", // Голубой
 "#FF9800", // Оранжевый
 "#795548", // Коричневый
 "#607D8B", // Серо-синий
 "#E91E63", // Розовый
];

// Хук для назначения цветов пользователям
export function useUserColors(
 users: ReadonlyArray<User<Presence, BaseUserMeta>>
) {
 return useMemo(() => {
   // Создаем Map для хранения цветов пользователей
   const userColors = new Map<number, string>();

   // Назначаем цвета пользователям
   users.forEach((user) => {
     // Если у пользователя еще нет цвета
     if (!userColors.has(user.connectionId)) {
       // Присваиваем цвет на основе connectionId
       userColors.set(
         user.connectionId,
         COLORS[user.connectionId % COLORS.length]
       );
     }
   });

   return userColors;
 }, [users]); // только при изменении списка пользователей - пересчёт
}

export { COLORS };
