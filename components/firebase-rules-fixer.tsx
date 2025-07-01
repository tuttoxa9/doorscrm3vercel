"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function FirebaseRulesFixer() {
  const [step, setStep] = useState(1)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Правила скопированы в буфер обмена")
  }

  const testRules = `rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Разрешить чтение и запись всем (ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ)
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`

  const productionRules = `rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /products/{productId}/{allPaths=**} {
      // Чтение разрешено всем
      allow read: if true;

      // Запись только для аутентифицированных пользователей
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024  // Максимум 5MB
        && request.resource.contentType.matches('image/.*');  // Только изображения
    }

    // Для других файлов - только аутентифицированные пользователи
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-600">Исправление ошибки 412 Firebase Storage</CardTitle>
        </div>
        <CardDescription>
          Пошаговые инструкции для исправления правил безопасности Firebase Storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Проблема обнаружена</AlertTitle>
          <AlertDescription>
            Ошибка 412 (Precondition Failed) указывает на неправильные правила безопасности Firebase Storage.
            Следуйте инструкциям ниже для исправления.
          </AlertDescription>
        </Alert>

        {/* Шаг 1 */}
        <div className={`border rounded-lg p-4 ${step >= 1 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={step >= 1 ? "default" : "outline"}>Шаг 1</Badge>
            <h3 className="font-semibold">Откройте Firebase Console</h3>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              1. Перейдите в <strong>Firebase Console</strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Открыть Firebase Console
            </Button>
          </div>

          <div className="mt-3">
            <Button
              size="sm"
              onClick={() => setStep(Math.max(2, step))}
              disabled={step >= 2}
            >
              Далее
            </Button>
          </div>
        </div>

        {/* Шаг 2 */}
        <div className={`border rounded-lg p-4 ${step >= 2 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={step >= 2 ? "default" : "outline"}>Шаг 2</Badge>
            <h3 className="font-semibold">Найдите ваш проект</h3>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              2. Выберите проект: <strong>mebel-be602</strong>
            </p>
            <p className="text-sm text-gray-600">
              3. В левом меню выберите <strong>Storage</strong>
            </p>
            <p className="text-sm text-gray-600">
              4. Перейдите на вкладку <strong>Rules</strong>
            </p>
          </div>

          <div className="mt-3">
            <Button
              size="sm"
              onClick={() => setStep(Math.max(3, step))}
              disabled={step >= 3}
            >
              Далее
            </Button>
          </div>
        </div>

        {/* Шаг 3 */}
        <div className={`border rounded-lg p-4 ${step >= 3 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={step >= 3 ? "default" : "outline"}>Шаг 3</Badge>
            <h3 className="font-semibold">Замените правила на тестовые</h3>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Скопируйте и вставьте эти правила в Firebase Console:
            </p>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre>{testRules}</pre>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(testRules)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Скопировать правила
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Внимание:</strong> Эти правила разрешают доступ всем пользователям.
                Используйте только для тестирования!
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-3">
            <Button
              size="sm"
              onClick={() => setStep(Math.max(4, step))}
              disabled={step >= 4}
            >
              Правила скопированы
            </Button>
          </div>
        </div>

        {/* Шаг 4 */}
        <div className={`border rounded-lg p-4 ${step >= 4 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={step >= 4 ? "default" : "outline"}>Шаг 4</Badge>
            <h3 className="font-semibold">Опубликуйте правила</h3>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              5. В Firebase Console нажмите кнопку <strong>"Publish"</strong>
            </p>
            <p className="text-sm text-gray-600">
              6. Подождите несколько секунд для применения изменений
            </p>
          </div>

          <div className="mt-3">
            <Button
              size="sm"
              onClick={() => setStep(Math.max(5, step))}
              disabled={step >= 5}
            >
              Правила опубликованы
            </Button>
          </div>
        </div>

        {/* Шаг 5 */}
        <div className={`border rounded-lg p-4 ${step >= 5 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={step >= 5 ? "default" : "outline"}>Шаг 5</Badge>
            <h3 className="font-semibold">Протестируйте загрузку</h3>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              7. Перейдите на страницу <strong>/test-upload</strong>
            </p>
            <p className="text-sm text-gray-600">
              8. Попробуйте загрузить изображение
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/test-upload', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Открыть страницу тестирования
            </Button>
          </div>

          {step >= 5 && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Отлично! Теперь загрузка должна работать. После успешного тестирования
                рекомендуется установить более безопасные правила.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Производственные правила */}
        {step >= 5 && (
          <div className="border rounded-lg p-4 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">Дополнительно</Badge>
              <h3 className="font-semibold">Безопасные правила для продакшена</h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                После тестирования замените правила на более безопасные:
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{productionRules}</pre>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(productionRules)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Скопировать безопасные правила
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
