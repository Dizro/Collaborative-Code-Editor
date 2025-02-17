// Middleware для авторизации Liveblocks
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Liveblocks } from "@liveblocks/node";

export async function middleware(request: NextRequest) {
 // Получаем секретный ключ из переменных окружения
 const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;

 // Проверяем валидность ключа
 if (!secretKey?.startsWith("sk_")) {
   return NextResponse.json(
     { error: "Invalid configuration" },
     { status: 500 }
   );
 }

 try {
   // Инициализируем Liveblocks клиент
   const liveblocks = new Liveblocks({ secret: secretKey });

   // Создаем временную сессию для анонимного пользователя
   const session = liveblocks.prepareSession(
     `user-${Math.random().toString(36).substring(2)}`, // Генерируем случайный ID
     {
       userInfo: {
         name: "Anonymous",
       }
     }
   );

   // Получаем ID комнаты из параметров или даем доступ ко всем комнатам
   const room = request.nextUrl.searchParams.get("room") || "*";
   
   // Даем полный доступ к комнате
   session.allow(room, session.FULL_ACCESS);

   // Авторизуем сессию
   const { status, body } = await session.authorize();
   return new NextResponse(body, { status });
 } catch (error) {
   // В случае ошибки возвращаем 403
   return NextResponse.json(
     { error: "Authorization failed" },
     { status: 403 }
   );
 }
}

// Конфигурация middleware - применяется только к API роутам Liveblocks
export const config = {
 matcher: ["/api/liveblocks/:path*"]
};