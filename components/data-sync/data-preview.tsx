"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, Eye, Database } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface DataPreviewProps {
  collectionName: string
  title: string
}

export function DataPreview({ collectionName, title }: DataPreviewProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setData(items)
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: `Не удалось загрузить данные из коллекции ${collectionName}`,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [collectionName])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>Коллекция: {collectionName}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{data.length} записей</Badge>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-2">
            {data.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedItem(item)}
              >
                <div>
                  <p className="font-medium text-sm">{item.name || item.title || item.email || item.id}</p>
                  <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                </div>
                <Eye className="h-4 w-4" />
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">И еще {data.length - 5} записей...</p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Нет данных в коллекции</p>
          </div>
        )}

        {selectedItem && (
          <div className="mt-4 p-3 border rounded bg-muted/20">
            <h4 className="font-medium mb-2">Структура данных:</h4>
            <Textarea value={JSON.stringify(selectedItem, null, 2)} readOnly className="font-mono text-xs" rows={10} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
