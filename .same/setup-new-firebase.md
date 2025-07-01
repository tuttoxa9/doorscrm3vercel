# Настройка нового Firebase проекта mebel-be602

## 🔥 Шаги настройки:

### 1. Firebase Console
Перейдите в [Firebase Console](https://console.firebase.google.com/) и выберите проект `mebel-be602`

### 2. Настройка Authentication
1. Перейдите в Authentication → Sign-in method
2. Включите **Email/Password**
3. Включите **Anonymous** (для гостевого доступа)

### 3. Настройка Firestore Database
1. Перейдите в Firestore Database
2. Создайте базу данных в режиме **Test mode**
3. Установите правила:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to any user signed in to the application
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Настройка Firebase Storage
1. Перейдите в Storage
2. Создайте bucket
3. Установите правила:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Создание коллекций
Создайте следующие коллекции в Firestore:
- `products`
- `categories`
- `orders`
- `users`
- `gallery`
- `settings`

### 6. Тестирование
После настройки кнопка "Проверить Firebase" должна показывать зеленый статус.

## ⚠️ Важно
Убедитесь что все правила настроены для аутентифицированных пользователей (`request.auth != null`)
