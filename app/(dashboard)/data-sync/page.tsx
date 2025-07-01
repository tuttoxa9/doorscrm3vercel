"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataPreview } from "@/components/data-sync/data-preview"
import { FirebaseRulesChecker } from "@/components/data-sync/firebase-rules-checker"
import { DatabaseConnectionCheck } from "@/components/database-connection-check"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DataSyncPage() {
  const { toast } = useToast()

  const firebaseRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешить чтение всем для основного сайта
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /categories/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /gallery/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Заказы - только для авторизованных
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Пользователи - только для авторизованных
    match /users/{document} {
      allow read, write: if request.auth != null;
    }
  }
}`

  const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Разрешить чтение всем, запись только авторизованным
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Скопировано",
      description: `Правила ${type} скопированы в буфер обмена`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Синхронизация данных</h1>
        <p className="text-muted-foreground">Диагностика и настройка синхронизации между CRM и основным сайтом</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Если данные из CRM не отображаются на основном сайте, проверьте структуру данных, правила безопасности
          Firebase и убедитесь, что сайт использует те же коллекции.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Просмотр данных</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="rules">Правила Firebase</TabsTrigger>
          <TabsTrigger value="troubleshooting">Решение проблем</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <DatabaseConnectionCheck />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataPreview collectionName="products" title="Товары" />
            <DataPreview collectionName="categories" title="Категории" />
            <DataPreview collectionName="gallery" title="Галерея" />
            <DataPreview collectionName="orders" title="Заказы" />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <FirebaseRulesChecker />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Правила Firestore
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(firebaseRules, "Firestore")}>
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать
                  </Button>
                </CardTitle>
                <CardDescription>Правила безопасности для базы данных Firestore</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={firebaseRules} readOnly className="font-mono text-xs" rows={20} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Правила Storage
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(storageRules, "Storage")}>
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать
                  </Button>
                </CardTitle>
                <CardDescription>Правила безопасности для Firebase Storage</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={storageRules} readOnly className="font-mono text-xs" rows={20} />
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Важно:</strong> Скопируйте эти правила в консоль Firebase (Firestore Database → Rules и Storage →
              Rules). Правила разрешают чтение данных всем пользователям (для основного сайта) и запись только
              авторизованным (для CRM).
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Частые проблемы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">1. Данные не отображаются на сайте</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Проверьте правила безопасности Firebase</li>
                    <li>• Убедитесь, что сайт использует те же коллекции</li>
                    <li>• Проверьте структуру данных</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">2. Ошибки доступа</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Настройте правила чтения для публичного доступа</li>
                    <li>• Проверьте конфигурацию Firebase на сайте</li>
                    <li>• Убедитесь в корректности API ключей</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">3. Изображения не загружаются</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Настройте правила Storage для публичного чтения</li>
                    <li>• Проверьте CORS настройки</li>
                    <li>• Убедитесь в корректности URL изображений</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Рекомендации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Структура данных</h4>
                  <p className="text-sm text-muted-foreground">
                    Убедитесь, что основной сайт ожидает те же поля, что создает CRM:
                  </p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• products: name, price, category, description, images, inStock</li>
                    <li>• categories: name, slug, description, order</li>
                    <li>• gallery: title, imageUrl, category, order</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Кэширование</h4>
                  <p className="text-sm text-muted-foreground">
                    Если сайт использует кэширование, данные могут обновляться с задержкой. Проверьте настройки кэша или
                    очистите его.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Мониторинг</h4>
                  <p className="text-sm text-muted-foreground">
                    Используйте консоль Firebase для мониторинга запросов и ошибок. Проверяйте логи в разделе "Usage" и
                    "Monitoring".
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
