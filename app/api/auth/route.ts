// Импортируем нужные типы из next/server

// liveblocks documentation
import { NextRequest, NextResponse } from "next/server";
import { Liveblocks } from "@liveblocks/node";

// Создаем экземпляр Liveblocks с секретным ключом из переменных окружения
const liveblocks = new Liveblocks({ 
 secret: process.env.LIVEBLOCKS_SECRET_KEY!, 
});

// POST эндпоинт для авторизации
export async function POST(request: NextRequest) {
 // Получаем название комнаты из тела запроса
 const { room } = await request.json();

 // Генерируем случайный ID для анонимного пользователя
 const userId = `user-${Math.random().toString(36).substring(2)}`;

 // Создаем сессию с базовой инфой о пользователе
 const session = liveblocks.prepareSession(userId, {
   userInfo: {
     name: "Anonymous",
     // Генерируем случайный цвет в HEX формате
     color: "#" + Math.floor(Math.random()*16777215).toString(16),
   },
 });

 // Даем полный доступ к комнате
 session.allow(room, session.FULL_ACCESS);

 // Авторизуем сессию и получаем статус
 const { status, body } = await session.authorize();

 // Возвращаем результат
 return new NextResponse(body, { status });
}