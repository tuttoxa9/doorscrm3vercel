"use client"

import { useState } from "react"
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface RuleTest {
  name: string
  status: "pending" | "success" | "error"
  message: string
}

export function FirebaseRulesChecker() {
  const [testing, setTesting] = useState(false)
  const [tests, setTests] = useState<RuleTest[]>([])
  const { toast } = useToast()

  const runSecurityTests = async () => {
    setTesting(true)
    const testResults: RuleTest[] = []

    // Test 1: Read access to products
    try {
      await getDocs(collection(db, "products"))
      testResults.push({
        name: "Чтение товаров",
        status: "success",
        message: "Доступ к чтению товаров разрешен",
      })
    } catch (error) {
      testResults.push({
        name: "Чтение товаров",
        status: "error",
        message: `Ошибка чтения: ${error}`,
      })
    }

    // Test 2: Write access to products
    try {
      const testDoc = await addDoc(collection(db, "products"), {
        name: "TEST_PRODUCT_DELETE_ME",
        price: 0,
        category: "test",
        description: "Test product for security check",
        images: [],
        inStock: false,
        createdAt: new Date(),
      })

      // Try to delete the test document
      await deleteDoc(doc(db, "products", testDoc.id))

      testResults.push({
        name: "Запись товаров",
        status: "success",
        message: "Доступ к записи товаров разрешен",
      })
    } catch (error) {
      testResults.push({
        name: "Запись товаров",
        status: "error",
        message: `Ошибка записи: ${error}`,
      })
    }

    // Test 3: Read access to categories
    try {
      await getDocs(collection(db, "categories"))
      testResults.push({
        name: "Чтение категорий",
        status: "success",
        message: "Доступ к чтению категорий разрешен",
      })
    } catch (error) {
      testResults.push({
        name: "Чтение категорий",
        status: "error",
        message: `Ошибка чтения: ${error}`,
      })
    }

    // Test 4: Read access to orders
    try {
      await getDocs(collection(db, "orders"))
      testResults.push({
        name: "Чтение заказов",
        status: "success",
        message: "Доступ к чтению заказов разрешен",
      })
    } catch (error) {
      testResults.push({
        name: "Чтение заказов",
        status: "error",
        message: `Ошибка чтения: ${error}`,
      })
    }

    // Test 5: Read access to gallery
    try {
      await getDocs(collection(db, "gallery"))
      testResults.push({
        name: "Чтение галереи",
        status: "success",
        message: "Доступ к чтению галереи разрешен",
      })
    } catch (error) {
      testResults.push({
        name: "Чтение галереи",
        status: "error",
        message: `Ошибка чтения: ${error}`,
      })
    }

    setTests(testResults)
    setTesting(false)

    const hasErrors = testResults.some((test) => test.status === "error")
    if (hasErrors) {
      toast({
        variant: "destructive",
        title: "Обнаружены проблемы",
        description: "Некоторые тесты безопасности не прошли",
      })
    } else {
      toast({
        title: "Все тесты пройдены",
        description: "Правила безопасности Firebase настроены корректно",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Успешно</Badge>
      case "error":
        return <Badge variant="destructive">Ошибка</Badge>
      default:
        return <Badge variant="outline">Ожидание</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Проверка правил безопасности
          </CardTitle>
          <CardDescription>Тестирование доступа к коллекциям Firebase</CardDescription>
        </div>
        <Button onClick={runSecurityTests} disabled={testing} variant="outline">
          {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
          {testing ? "Тестирование..." : "Запустить тесты"}
        </Button>
      </CardHeader>
      <CardContent>
        {tests.length > 0 ? (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium text-sm">{test.name}</p>
                    <p className="text-xs text-muted-foreground">{test.message}</p>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Нажмите "Запустить тесты" для проверки правил безопасности</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
