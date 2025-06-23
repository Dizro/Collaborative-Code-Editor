import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

interface Avatar {
  id: string;
  name: string;
  image: string;
  category: "tech" | "smart" | "device" | "fun";
}

const avatars: Avatar[] = [
  { id: "capybara", name: "Кодовая Капибара", image: "/avatars/capybara.png", category: "tech" },
  { id: "dog", name: "Скриптовая Собака", image: "/avatars/dog.png", category: "tech" },
  { id: "hamster", name: "Хакерский Хомяк", image: "/avatars/hamster.png", category: "tech" },
  { id: "cat", name: "Регулярокошка", image: "/avatars/cat.png", category: "tech" },
  { id: "chipmunk", name: "Бэкапный Бурундук", image: "/avatars/chipmunk.png", category: "smart" },
  { id: "stork", name: "Алгоритмический Аист", image: "/avatars/stork.png", category: "smart" },
  { id: "mouse", name: "ИИ Мышь", image: "/avatars/mouse.png", category: "smart" },
  { id: "quantum", name: "Квантовый Лэптоп", image: "/avatars/quantum.png", category: "device" },
  { id: "buffer", name: "Бездонный Буфер", image: "/avatars/buffer.png", category: "device" },
  { id: "squirrel", name: "Багнутая Белка", image: "/avatars/squirrel.png", category: "fun" },
  { id: "otter", name: "Оверфлоу-Баг", image: "/avatars/otter.png", category: "fun" },
];

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
  const { data: session } = useSession();
  const [authMethod, setAuthMethod] = useState<"anonymous" | "email" | "google" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Avatar["category"]>("tech");

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

  const handleAnonymousSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatar) return;
    onAuth({
      id: `user-${Date.now()}`,
      username: selectedAvatar.name,
      avatar: selectedAvatar.image,
      info: { avatar: selectedAvatar.image, color: getRandomGradient() },
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

  const getRandomGradient = (): [string, string] => {
    const gradients: [string, string][] = [
      ["#FF0099", "#FF7A00"], ["#002A95", "#00A0D2"], ["#6116FF", "#E32DD1"],
      ["#0EC4D1", "#1BCC00"], ["#FF00C3", "#FF3333"], ["#00C04D", "#00FFF0"],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const filteredAvatars = avatars.filter(avatar => avatar.category === selectedCategory);

  if (!authMethod) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary p-4">
        <div className="bg-background p-8 rounded-2xl shadow-lg w-full max-w-sm border border-border">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground">CodeSync</h1>
          </div>
          <h2 className="text-2xl font-medium text-foreground mb-8 text-center">Добро пожаловать</h2>
          <div className="space-y-3">
            <button onClick={() => setAuthMethod("anonymous")} className="w-full p-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium text-sm">
              Продолжить как гость
            </button>
            <button onClick={() => setAuthMethod("email")} className="w-full p-3.5 bg-background-secondary text-foreground-secondary border border-border rounded-xl hover:border-primary/50 transition-colors duration-200 font-medium text-sm">
              Войти через почту
            </button>
            <button onClick={() => signIn("google")} className="w-full p-3.5 bg-background-secondary text-foreground-secondary border border-border rounded-xl hover:border-primary/50 transition-colors duration-200 font-medium text-sm">
              Войти через Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authMethod === "anonymous") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary p-4">
        <div className="bg-background p-8 rounded-2xl shadow-lg w-full max-w-xl border border-border">
          <button onClick={() => setAuthMethod(null)} className="text-foreground-secondary hover:text-foreground mb-6 flex items-center gap-2 transition-colors duration-200">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Назад
          </button>
          <h2 className="text-2xl font-medium text-foreground mb-6">Выберите аватар</h2>
          <form onSubmit={handleAnonymousSubmit} className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {(["tech", "smart", "device", "fun"] as const).map((category) => (
                <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-background-secondary text-foreground-secondary border border-border hover:border-primary/50"}`}>
                  {category === "tech" && "Технологичные"}
                  {category === "smart" && "Умные"}
                  {category === "device" && "Девайсы"}
                  {category === "fun" && "Забавные"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAvatars.map((avatar) => (
                <div key={avatar.id} onClick={() => setSelectedAvatar(avatar)} className={`cursor-pointer p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${selectedAvatar?.id === avatar.id ? "bg-primary ring-2 ring-ring-color" : "bg-background-secondary border border-border hover:border-primary/50"}`}>
                  <Image src={avatar.image} alt={avatar.name} width={80} height={80} className="rounded-lg mb-3 mx-auto" />
                  <p className={`text-sm text-center font-medium ${selectedAvatar?.id === avatar.id ? "text-primary-foreground" : "text-foreground"}`}>{avatar.name}</p>
                </div>
              ))}
            </div>
            <button type="submit" disabled={!selectedAvatar} className="w-full p-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm">
              Продолжить
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (authMethod === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary p-4">
        <div className="bg-background p-8 rounded-2xl shadow-lg w-full max-w-sm border border-border">
          <button onClick={() => setAuthMethod(null)} className="text-foreground-secondary hover:text-foreground mb-6 flex items-center gap-2 transition-colors duration-200">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Назад
          </button>
          <h2 className="text-2xl font-medium text-foreground mb-6">Вход через почту</h2>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Почта" className="w-full p-3.5 bg-background text-foreground border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-ring-color transition-colors duration-200 outline-none" required />
            </div>
            <div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full p-3.5 bg-background text-foreground border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-ring-color transition-colors duration-200 outline-none" required />
            </div>
            <button type="submit" className="w-full p-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium text-sm">
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
