
# CodeSync: Платформа для совместной разработки в реальном времени

**CodeSync** — это многофункциональная веб-платформа, созданная для совместного написания кода, проведения технических собеседований и обучения программированию в интерактивном режиме. Она объединяет в себе мощный редактор кода, инструменты для коммуникации и уникальные возможности для совместной работы.

## Демонстрация

![Демонстрация работы CodeSync](demo/github.mp4)

## 🚀 Ключевые возможности

-   **Совместное редактирование в реальном времени**: Идеально точная синхронизация курсоров, выделений и текста между всеми участниками.
-   **Файловая система**: Управляйте файлами и папками проекта с помощью интуитивного древовидного интерфейса с поддержкой drag-and-drop.
-   **Импорт из GitHub**: Загружайте целые публичные репозитории в один клик, чтобы начать работу над существующим проектом.
-   **Скачивание проекта**: Сохраняйте всю работу в виде ZIP-архива в любой момент.
-   **ИИ-ассистент**: Встроенный помощник на базе **GigaChat API** для анализа кода, поиска ошибок и предложений по улучшению.
-   **Встроенная коммуникация**: Общайтесь с командой через интегрированный текстовый и голосовой чаты.
-   **Гибкая аутентификация**: Входите через Google, по почте или как гость с выбором уникального аватара.
-   **Адаптивный дизайн**: Полноценная работа как на десктопе, так и на мобильных устройствах.
-   **Персонализация**: Переключайтесь между светлой, темной и "океанской" темами для комфортной работы.

## 🛠️ Стек технологий

-   **Фреймворк**: [Next.js](https://nextjs.org/) (React)
-   **Язык**: [TypeScript](https://www.typescriptlang.org/)
-   **Синхронизация (Real-time)**: [Liveblocks](https://liveblocks.io/)
-   **Редактор кода**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (ядро VS Code)
-   **Стилизация**: [Tailwind CSS](https://tailwindcss.com/)
-   **Аутентификация**: [NextAuth.js](https://next-auth.js.org/)
-   **ИИ-ассистент**: [GigaChat API](https://developers.sber.ru/portal/products/gigachat-api)
-   **Анимации**: [Framer Motion](https://www.framer.com/motion/)

## ⚙️ Установка и запуск

Следуйте этим шагам, чтобы запустить проект локально.

### 1. Клонирование репозитория

```bash
git clone https://github.com/Dizro/Collaborative-Code-Editor.git
cd Collaborative-Code-Editor
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта, скопировав содержимое из `.env.example` (если он есть) или создав его с нуля. Заполните его вашими ключами:

```env
# Liveblocks (https://liveblocks.io/dashboard/projects)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_...
LIVEBLOCKS_SECRET_KEY=sk_dev_...

# Google OAuth (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=ВАШ_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=ВАШ_GOOGLE_CLIENT_SECRET

# NextAuth
# Сгенерируйте случайную строку (например, через `openssl rand -base64 32`)
NEXTAUTH_SECRET=ВАШ_СЕКРЕТНЫЙ_КЛЮЧ
NEXTAUTH_URL=http://localhost:3000

# GigaChat API (https://developers.sber.ru/studio/workspaces)
GIGACHAT_AUTHORIZATION_KEY=ВАШ_КЛЮЧ_АВТОРИЗАЦИИ_ОТ_GIGACHAT
```

#### Где получить ключи?

-   **Liveblocks**: Зарегистрируйтесь на [liveblocks.io](https://liveblocks.io), создайте проект и скопируйте публичный (`pk_...`) и секретный (`sk_...`) ключи из настроек.
-   **Google OAuth**:
    1.  Перейдите в [Google Cloud Console](https://console.cloud.google.com) и создайте проект.
    2.  В разделе "API и сервисы" -> "Учетные данные" создайте "Идентификатор клиента OAuth 2.0".
    3.  В "Авторизованные URI перенаправления" добавьте `http://localhost:3000/api/auth/callback/google`.
    4.  Скопируйте Client ID и Client Secret.
-   **GigaChat API**:
    1.  Зарегистрируйтесь в [SberDevelopers Studio](https://developers.sber.ru/studio/workspaces).
    2.  Создайте проект с GigaChat API.
    3.  В настройках API проекта получите ваш `Authorization key`.

### 4. Запуск проекта

Для локальной разработки используйте следующую команду. Она отключает проверку TLS-сертификатов, что необходимо для работы с GigaChat API локально.

```bash
npm run dev
```

После этого откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## 📂 Структура проекта

```
.
├── app/                  # Основная директория Next.js 13+
│   ├── api/              # API роуты (для авторизации, ИИ и т.д.)
│   ├── rooms/[roomId]/   # Динамическая страница комнаты
│   └── ...               # Глобальные стили, layout и главная страница
├── components/           # Переиспользуемые React-компоненты
│   ├── room/             # Компоненты, специфичные для комнаты (чаты, навбар)
│   └── ...               # Общие компоненты (аватары, кнопки)
├── contexts/             # React Contexts (например, для темы)
├── hooks/                # Кастомные хуки
├── liveblocks.config.ts  # Центральная конфигурация типов Liveblocks
├── public/               # Статические ассеты (иконки, аватары)
└── types/                # Глобальные TypeScript типы
```
