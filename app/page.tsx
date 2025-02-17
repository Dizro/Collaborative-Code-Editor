"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Auth from "@/components/Auth";
import MainMenu from "@/components/MainMenu";
import type { UserData } from "@/types/room";

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    localStorage.removeItem("userData"); // Очищаем локальное хранилище
    setUserData(null);
    if (session) {
      await signOut({ redirect: false }); // Выходим из NextAuth сессии
    }
  };

  if (!userData) {
    return (
      <Auth
        onAuth={(data) => {
          setUserData(data);
          localStorage.setItem("userData", JSON.stringify(data));
        }}
      />
    );
  }

  return <MainMenu userData={userData} onSignOut={handleSignOut} />;
}
