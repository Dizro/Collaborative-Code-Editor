// Клиентский провайдер для Next-Auth сессий
"use client";

import { SessionProvider } from "next-auth/react";

// Компонент-обертка для предоставления сессии всему приложению
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
