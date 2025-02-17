// app/api/rooms/[roomId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Liveblocks } from '@liveblocks/node';

// Проверяем наличие и формат ключей Liveblocks
function validateEnvVariables() {
 const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;
 const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

 if (!secretKey || !publicKey) {
   throw new Error("Missing Liveblocks keys");
 }

 if (!secretKey.startsWith('sk_dev_')) {
   throw new Error("Invalid secret key format"); 
 }

 if (!publicKey.startsWith('pk_dev_')) {
   throw new Error("Invalid public key format");
 }

 return secretKey;
}

// Дефолтные настройки комнаты
const defaultSettings = {
 roomName: "Default Room",
 isPrivate: false,
 enableVoiceChat: true,
 enableTextChat: true,
 requireVoteForCompilation: false,
 maxUsers: 10,
};

// GET эндпоинт для получения/создания комнаты
export async function GET(request: NextRequest) {
 try {
   // Проверяем переменные окружения
   const secretKey = validateEnvVariables();

   // Инициализируем Liveblocks
   const liveblocks = new Liveblocks({
     secret: secretKey,
   });

   // Получаем ID комнаты из URL
   const roomId = request.nextUrl.pathname.split('/').pop();

   if (!roomId) {
     return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
   }

   try {
     // Пробуем получить существующую комнату
     await liveblocks.getRoom(roomId);
     
     return NextResponse.json({
       settings: defaultSettings,
       id: roomId
     });
   } catch (error: unknown) {
     // Если комнаты нет - создаем новую
     if (typeof error === 'object' && error && 
         ('status' in error || 'error' in error)) {
       const e = error as { status?: number; error?: string };
       if (e.status === 404 || e.error === "ROOM_NOT_FOUND") {
         await liveblocks.createRoom(roomId, {
           defaultAccesses: ["room:write"],
           metadata: {
             settings: JSON.stringify(defaultSettings)
           }
         });

         return NextResponse.json({
           settings: defaultSettings,
           id: roomId
         });
       }
     }
     throw error;
   }
 } catch (error) {
   console.error('API Error:', error);
   
   // Обработка ошибок
   if (error instanceof Error) {
     return NextResponse.json(
       { error: error.message },
       { status: 500 }  
     );
   }

   return NextResponse.json(
     { error: "Internal server error" },
     { status: 500 }
   );
 }
}