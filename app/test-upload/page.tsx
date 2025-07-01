import { TestImageUpload } from "@/components/test-image-upload"

export default function TestUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Тестирование загрузки изображений</h1>
        <p className="text-gray-600">
          Эта страница создана для отладки и тестирования загрузки изображений в Firebase Storage
        </p>
      </div>

      <TestImageUpload />
    </div>
  )
}
