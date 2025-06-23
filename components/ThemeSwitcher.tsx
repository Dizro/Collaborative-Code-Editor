"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { FiSun, FiMoon, FiDroplet } from "react-icons/fi";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: "light", icon: <FiSun /> },
    { name: "dark", icon: <FiMoon /> },
    { name: "ocean", icon: <FiDroplet /> },
  ] as const;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].name);
  };

  const currentIcon = themes.find((t) => t.name === theme)?.icon;

  return (
    <button
      onClick={cycleTheme}
      className="p-3 rounded-xl transition-colors duration-200 text-[#686B75] hover:bg-gray-50 hover:text-[#323C46]"
      title={`Сменить тему (текущая: ${theme})`}
    >
      {currentIcon}
    </button>
  );
}
