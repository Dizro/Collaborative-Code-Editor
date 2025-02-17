// Компонент авторизации с разными способами входа
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

// Интерфейс для аватаров
interface Avatar {
  id: string;
  name: string;
  image: string;
  category: "tech" | "smart" | "device" | "fun";
}

// Массив доступных аватаров
const avatars: Avatar[] = [
  {
    id: "capybara",
    name: "Кодовая Капибара",
    image: "/avatars/capybara.png",
    category: "tech",
  },
  {
    id: "dog",
    name: "Скриптовая Собака",
    image: "/avatars/dog.png",
    category: "tech",
  },
  {
    id: "hamster",
    name: "Хакерский Хомяк",
    image: "/avatars/hamster.png",
    category: "tech",
  },
  {
    id: "cat",
    name: "Регулярокошка",
    image: "/avatars/cat.png",
    category: "tech",
  },
  {
    id: "chipmunk",
    name: "Бэкапный Бурундук",
    image: "/avatars/chipmunk.png",
    category: "smart",
  },
  {
    id: "stork",
    name: "Алгоритмический Аист",
    image: "/avatars/stork.png",
    category: "smart",
  },
  {
    id: "mouse",
    name: "ИИ Мышь",
    image: "/avatars/mouse.png",
    category: "smart",
  },
  {
    id: "quantum",
    name: "Квантовый Лэптоп",
    image: "/avatars/quantum.png",
    category: "device",
  },
  {
    id: "buffer",
    name: "Бездонный Буфер",
    image: "/avatars/buffer.png",
    category: "device",
  },
  {
    id: "squirrel",
    name: "Багнутая Белка",
    image: "/avatars/squirrel.png",
    category: "fun",
  },
  {
    id: "otter",
    name: "Оверфлоу-Баг",
    image: "/avatars/otter.png",
    category: "fun",
  },
];

// Пропсы компонента
interface Props {
  onAuth: (userData: {
    id: string;
    username: string;
    avatar: string;
    info: {
      avatar: string;
      color: [string, string];
    };
  }) => void;
}

export default function Auth({ onAuth }: Props) {
  // Состояния и хуки
  const { data: session } = useSession();
  const [authMethod, setAuthMethod] = useState<
    "anonymous" | "email" | "google" | null
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<Avatar["category"]>("tech");

  // Обработка авторизации через Google
  useEffect(() => {
    if (session?.user) {
      onAuth({
        id: session.user.id || `google-${Date.now()}`,
        username: session.user.name || "Google User",
        avatar: session.user.image || "/avatars/default.png",
        info: {
          avatar: session.user.image || "/avatars/default.png",
          color: getRandomGradient(),
        },
      });
    }
  }, [session, onAuth]);

  // Обработчики авторизации
  const handleAnonymousSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatar) return;

    onAuth({
      id: `user-${Date.now()}`,
      username: selectedAvatar.name,
      avatar: selectedAvatar.image,
      info: {
        avatar: selectedAvatar.image,
        color: getRandomGradient(),
      },
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onAuth({
        id: `email-${Date.now()}`,
        username: email.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
        info: {
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
          color: getRandomGradient(),
        },
      });
    } catch (error) {
      console.error("Email auth error:", error);
    }
  };

  // Генерация случайного градиента
  const getRandomGradient = (): [string, string] => {
    const gradients: [string, string][] = [
      ["#FF0099", "#FF7A00"],
      ["#002A95", "#00A0D2"],
      ["#6116FF", "#E32DD1"],
      ["#0EC4D1", "#1BCC00"],
      ["#FF00C3", "#FF3333"],
      ["#00C04D", "#00FFF0"],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Фильтрация аватаров по категории
  const filteredAvatars = avatars.filter(
    (avatar) => avatar.category === selectedCategory
  );

  if (!authMethod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <svg
              width="40"
              height="42"
              viewBox="0 0 51 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-3"
            >
              <path
                d="M1.48897 10.9374L1.65286 10.7946C1.72057 10.7355 1.78338 10.6711 1.84069 10.602C2.15661 10.2207 2.62602 10 3.1212 10H3.35126C3.76 10 4.16029 10.1164 4.50531 10.3356L4.74614 10.4885C5.65126 11.0635 6.19954 12.0613 6.19954 13.1336V32.593C6.19954 32.8244 6.22566 33.055 6.27739 33.2805C6.45277 34.0448 6.91365 34.7133 7.56571 35.1489L22.5849 45.1843C23.0446 45.4914 23.5431 45.7361 24.0673 45.9118L24.5958 46.089C24.8848 46.1859 25.1875 46.2353 25.4923 46.2353C26.0319 46.2353 26.5603 46.0804 27.0146 45.7891L43.4278 35.264C43.64 35.1279 43.8324 34.963 43.9994 34.774C44.4402 34.2753 44.6835 33.6326 44.6835 32.967V13.8088C44.6835 13.2371 44.8069 12.6722 45.0454 12.1526L45.1566 11.9101C45.3075 11.5813 45.5236 11.2866 45.7918 11.0438C46.283 10.5992 46.9219 10.3529 47.5845 10.3529H47.6802C48.4575 10.3529 49.2026 10.6629 49.7506 11.214L49.9515 11.4161C50.6231 12.0915 51 13.0052 51 13.9576V33.8314C51 35.2568 50.6616 36.6617 50.0127 37.9308C49.2806 39.3625 48.1784 40.5721 46.8207 41.4338L28.5845 53.0075C27.563 53.6558 26.3782 54 25.1685 54C23.9344 54 22.7269 53.6418 21.6924 52.9689L4.66764 41.8949C2.77828 40.6659 1.34594 38.8492 0.591733 36.7252C0.200129 35.6224 0 34.4608 0 33.2905V19.0588V14.2105C0 12.9556 0.542966 11.762 1.48897 10.9374Z"
                fill="#3C434A"
              />
              <path
                d="M15.6692 21.1528L22.9362 16.6313C24.5432 15.6314 26.577 15.6246 28.1907 16.6138L34.8302 20.6836C34.9898 20.7815 35.1296 20.9086 35.2422 21.0583C35.6797 21.6397 35.6334 22.452 35.1327 22.98L34.7238 23.4112L32.0993 25.4928C30.9545 26.4007 29.3686 26.5095 28.1105 25.7664C26.532 24.9341 24.6286 25.0109 23.1223 25.9677L21.8536 26.7736C21.6209 26.9215 21.3508 27 21.075 27C20.7474 27 20.4294 26.8892 20.1726 26.6856L16.2456 23.5709C16.1118 23.4648 15.9913 23.343 15.8866 23.2081L15.411 22.5951C15.1629 22.2754 15.1352 21.8366 15.3412 21.4883C15.4219 21.3517 15.5345 21.2366 15.6692 21.1528Z"
                fill="#3C434A"
              />
              <path
                d="M19.0465 13.4493L22.6794 10.9673C24.2921 9.86551 26.3987 9.80363 28.0733 10.8089L35.5725 15.3106C36.178 15.6741 36.9651 15.4157 37.2374 14.7641C37.2805 14.661 37.3084 14.5523 37.3203 14.4412L37.6694 11.1923C37.872 9.30727 36.991 7.46981 35.3943 6.44743L28.0566 1.7488C26.3953 0.685015 24.2639 0.697446 22.6151 1.78054L15.4419 6.49275C13.9624 7.47623 13.2168 9.25099 13.5502 10.996L14.2995 14.9183C14.3602 15.2364 14.5591 15.511 14.8424 15.6679C15.2089 15.8709 15.6593 15.8462 16.0013 15.6042L19.0465 13.4493Z"
                fill="#3C434A"
              />
            </svg>
            <h1 className="text-2xl font-semibold text-[#323C46]">CodeSync</h1>
          </div>
          <h2 className="text-2xl font-medium text-[#323C46] mb-8 text-center">
            Добро пожаловать
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setAuthMethod("anonymous")}
              className="w-full p-3.5 bg-[#323C46] text-white rounded-xl hover:bg-[#404a56] transition-colors duration-200 font-medium text-sm"
            >
              Продолжить как гость
            </button>
            <button
              onClick={() => setAuthMethod("email")}
              className="w-full p-3.5 bg-white text-[#686B75] border border-[#9197A0] rounded-xl hover:border-[#323C46] transition-colors duration-200 font-medium text-sm"
            >
              Войти через почту
            </button>
            <button
              onClick={() => signIn("google")}
              className="w-full p-3.5 bg-white text-[#686B75] border border-[#9197A0] rounded-xl hover:border-[#323C46] transition-colors duration-200 font-medium text-sm"
            >
              Войти через Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authMethod === "anonymous") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-[520px] border border-gray-100">
          <button
            onClick={() => setAuthMethod(null)}
            className="text-[#9197A0] hover:text-[#323C46] mb-6 flex items-center gap-2 transition-colors duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Назад
          </button>

          <h2 className="text-2xl font-medium text-[#323C46] mb-6">
            Выберите аватар
          </h2>

          <form onSubmit={handleAnonymousSubmit} className="space-y-6">
            <div className="flex gap-2 mb-6">
              {(["tech", "smart", "device", "fun"] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? "bg-[#323C46] text-white"
                      : "bg-white text-[#686B75] border border-[#9197A0] hover:border-[#323C46]"
                  }`}
                >
                  {category === "tech" && "Технологичные"}
                  {category === "smart" && "Умные"}
                  {category === "device" && "Девайсы"}
                  {category === "fun" && "Забавные"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {filteredAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`cursor-pointer p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                    selectedAvatar?.id === avatar.id
                      ? "bg-[#323C46] ring-2 ring-[#323C46]"
                      : "bg-white border border-[#9197A0] hover:border-[#323C46]"
                  }`}
                >
                  <Image
                    src={avatar.image}
                    alt={avatar.name}
                    width={80}
                    height={80}
                    className="rounded-lg mb-3 mx-auto"
                  />
                  <p
                    className={`text-sm text-center font-medium ${
                      selectedAvatar?.id === avatar.id
                        ? "text-white"
                        : "text-[#393B3A]"
                    }`}
                  >
                    {avatar.name}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={!selectedAvatar}
              className="w-full p-3.5 bg-[#323C46] text-white rounded-xl hover:bg-[#404a56] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Продолжить
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (authMethod === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-100">
          <button
            onClick={() => setAuthMethod(null)}
            className="text-[#9197A0] hover:text-[#323C46] mb-6 flex items-center gap-2 transition-colors duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Назад
          </button>

          <h2 className="text-2xl font-medium text-[#323C46] mb-6">
            Вход через почту
          </h2>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Почта"
                className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full p-3.5 bg-white text-[#393B3A] border border-[#9197A0] rounded-xl focus:border-[#323C46] focus:ring-1 focus:ring-[#323C46] transition-colors duration-200 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full p-3.5 bg-[#323C46] text-white rounded-xl hover:bg-[#404a56] transition-colors duration-200 font-medium text-sm"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
