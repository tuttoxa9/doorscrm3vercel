# Firebase Storage Security Rules

## Проблема
Ошибка 412 (Precondition Failed) при загрузке изображений в Firebase Storage обычно связана с неправильными правилами безопасности.

## Рекомендуемые правила для Firebase Storage

Перейдите в Firebase Console → Storage → Rules и замените существующие правила на:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Правила для папки products
    match /products/{productId}/{allPaths=**} {
      // Разрешить чтение всем
      allow read: if true;

      // Разрешить запись всем (для тестирования)
      // В продакшене следует добавить аутентификацию
      allow write: if true;

      // Альтернативный вариант с аутентификацией:
      // allow write: if request.auth != null;
    }

    // Правила для других папок (если есть)
    match /{allPaths=**} {
      // Разрешить чтение всем
      allow read: if true;

      // Разрешить запись всем (для тестирования)
      allow write: if true;
    }
  }
}
```

## Более безопасные правила (для продакшена)

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /products/{productId}/{fileName} {
      // Чтение разрешено всем
      allow read: if true;

      // Запись только для аутентифицированных пользователей
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024  // Максимум 5MB
        && request.resource.contentType.matches('image/.*');  // Только изображения
    }
  }
}
```

## Как применить правила

1. Откройте Firebase Console (https://console.firebase.google.com/)
2. Выберите ваш проект (mebel-be602)
3. Перейдите в Storage → Rules
4. Замените существующие правила на рекомендуемые выше
5. Нажмите "Publish"

## Дополнительные рекомендации

1. **Проверьте CORS настройки** - убедитесь что домен разрешен
2. **Проверьте квоты** - убедитесь что не превышены лимиты Storage
3. **Проверьте настройки проекта** - убедитесь что Storage включен для вашего проекта
