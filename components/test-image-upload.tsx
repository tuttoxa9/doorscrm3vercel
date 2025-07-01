"use client"

import { ImageUpload } from "@/components/ui/image-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function TestImageUpload() {
  const handleUploadSuccess = () => {
    console.log("Upload successful!")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Тест загрузки изображений</CardTitle>
        <CardDescription>
          Используйте этот компонент для тестирования загрузки изображений в Firebase Storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Перед тестированием убедитесь:</strong>
            <ul className="mt-2 space-y-1 list-disc ml-4">
              <li>Firebase Storage настроен и включен</li>
              <li>Правила безопасности Firebase Storage обновлены</li>
              <li>Проект имеет корректную конфигурацию Firebase</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageUpload onSuccess={handleUploadSuccess} />
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Что происходит при загрузке:</strong></p>
          <ul className="space-y-1 list-disc ml-4">
            <li>Файл проверяется на формат (JPG, PNG, WEBP) и размер (макс. 5MB)</li>
            <li>Создается уникальный ID продукта</li>
            <li>Файл загружается в Firebase Storage в папку products/</li>
            <li>Создается документ в Firestore с информацией о продукте</li>
            <li>Возвращается URL загруженного изображения</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
