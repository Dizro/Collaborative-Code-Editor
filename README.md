# Платформа для совместной разработки кода

Collaborative Code Editor - это веб-платформа для совместной разработки кода в реальном времени.

## Основные возможности

- Совместное редактирование кода в реальном времени
- Отображение курсоров и выделений других пользователей
- Встроенный текстовый и голосовой чат
- Древовидная структура файлов с drag-and-drop
- Система управления доступом к комнатам
- Голосование для компиляции кода

## Демонстрация
https://github.com/user-attachments/assets/8e97322c-8a8f-4532-bfa8-ef052e56a351


## Технологии

- **Frontend:** Next.js, React
- **Code Editor:** Monaco Editor
- **Real-time:** Liveblocks
- **Стили:** Tailwind CSS
- **Аутентификация:** NextAuth.js

## Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env.local` со следующими переменными:

```env
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=ваш_публичный_ключ_liveblocks
LIVEBLOCKS_SECRET_KEY=ваш_секретный_ключ_liveblocks
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ваш_секретный_ключ_nextauth
GOOGLE_CLIENT_ID=ваш_google_client_id
GOOGLE_CLIENT_SECRET=ваш_google_client_secret
```

4. Запустите проект:

```bash
npm run dev
```

5. Откройте [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
src/
├── components/        # React компоненты
├── hooks/            # Кастомные хуки
├── types/            # TypeScript типы
└── liveblocks/       # Конфигурация Liveblocks
```

## Основные компоненты

- `Editor.tsx` - основной компонент редактора
- `FileTree.tsx` - файловая система
- `Navbar.tsx` - навигационная панель
- `Auth.tsx` - компонент аутентификации

## Получение необходимых ключей

1. **Liveblocks:**

   - Зарегистрируйтесь на [liveblocks.io](https://liveblocks.io)
   - Создайте новый проект
   - Получите API ключи в настройках проекта

2. **Google OAuth:**

   - Перейдите в [Google Cloud Console](https://console.cloud.google.com)
   - Создайте проект и настройте OAuth 2.0
   - Получите Client ID и Client Secret

3. **NextAuth:**
   - Создайте случайный секретный ключ для NEXTAUTH_SECRET
   - Установите NEXTAUTH_URL для разработки как http://localhost:3000
