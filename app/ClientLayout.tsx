// Клиентский layout для подключения провайдеров
"use client";

import Providers from "@/components/Providers";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
