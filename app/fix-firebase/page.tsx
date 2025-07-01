import { FirebaseRulesFixer } from "@/components/firebase-rules-fixer"

export default function FixFirebasePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-red-600">
          🚨 Исправление ошибки Firebase Storage
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Обнаружена ошибка 412 при загрузке изображений. Следуйте пошаговым инструкциям ниже
          для исправления правил безопасности Firebase Storage.
        </p>
      </div>

      <FirebaseRulesFixer />

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Если проблема не решается, обратитесь к документации Firebase или
          проверьте настройки проекта в Firebase Console.
        </p>
      </div>
    </div>
  )
}
