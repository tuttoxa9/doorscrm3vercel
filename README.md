# DoorsCRM - Система управления товарами

CRM система для управления каталогом мебели с поддержкой Firebase.

## Возможности

- Управление товарами (продукты, столы, полки, комоды)
- Загрузка и управление изображениями
- Система пользователей и заказов
- Галерея товаров
- Панель администратора

## Технологии

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase (Firestore, Storage, Auth)
- Shadcn/ui

## Деплой на Vercel

### 1. Подготовка проекта

Проект уже подготовлен для деплоя на Vercel со всеми необходимыми конфигурациями.

### 2. Настройка переменных окружения

В панели Vercel добавьте следующие переменные окружения:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 3. Настройка Firebase

1. Создайте проект в Firebase Console
2. Включите Firestore Database
3. Включите Storage
4. Включите Authentication
5. Настройте правила безопасности для Firestore и Storage

### 4. Деплой

1. Подключите репозиторий к Vercel
2. Vercel автоматически определит Next.js проект
3. Добавьте переменные окружения в настройках проекта
4. Запустите деплой

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Запуск продакшн версии
npm start
```

## Структура проекта

```
├── app/                    # App Router страницы
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── products/         # Компоненты товаров
│   ├── dashboard/        # Компоненты панели
│   └── ...
├── lib/                  # Утилиты и конфигурации
│   ├── firebase/         # Firebase конфигурация
│   └── types/            # TypeScript типы
└── public/               # Статические файлы
```

## Особенности

- Responsive дизайн для всех устройств
- Оптимизированная загрузка изображений
- TypeScript для типобезопасности
- ESLint и Prettier для качества кода
- Готов к production деплою
