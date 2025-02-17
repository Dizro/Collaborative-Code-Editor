// app\api\rooms\route.ts
import { NextRequest, NextResponse } from "next/server";
import { Liveblocks } from '@liveblocks/node';

// Создаем экземпляр Liveblocks с секретным ключом
const liveblocks = new Liveblocks({
 secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// POST эндпоинт для создания новой комнаты
export async function POST(request: NextRequest) {
 try {
   // Получаем настройки и ID комнаты из запроса
   const { settings, roomId } = await request.json();

   // Создаем комнату с нужными правами доступа
   const room = await liveblocks.createRoom(roomId, {
     // Если комната приватная - пустой массив прав, иначе право на запись
     defaultAccesses: settings.isPrivate ? [] : ['room:write'],
     metadata: {
       settings,
     },
   });

   // Возвращаем ID созданной комнаты
   return NextResponse.json({ roomId: room.id });
 } catch (error) {
   // Логируем ошибку и возвращаем 500
   console.error('Error creating room:', error);
   return NextResponse.json(
     { message: 'Error creating room' },
     { status: 500 }
   );
 }
}