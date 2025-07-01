"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  status: string
  createdAt: any
  items: OrderItem[]
  total: number
  notes?: string
}

interface OrderDetailsProps {
  order: Order
  onSuccess: () => void
}

const ORDER_STATUSES = [
  { value: "new", label: "Новый" },
  { value: "processing", label: "В обработке" },
  { value: "completed", label: "Выполнен" },
  { value: "cancelled", label: "Отменен" },
]

export function OrderDetails({ order, onSuccess }: OrderDetailsProps) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleUpdateOrder = async () => {
    setIsSubmitting(true)
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status,
        notes,
        updatedAt: new Date(),
      })

      toast({
        title: "Успешно",
        description: "Заказ обновлен",
      })

      onSuccess()
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить заказ",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium">Информация о заказе</h3>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID заказа:</span>
              <span className="font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата:</span>
              <span>
                {order.createdAt && order.createdAt.toDate
                  ? format(order.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: ru })
                  : "Дата не указана"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сумма:</span>
              <span className="font-medium">{order.total.toLocaleString()} ₽</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Информация о клиенте</h3>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Имя:</span>
              <span>{order.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Телефон:</span>
              <span>{order.phone}</span>
            </div>
            {order.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{order.email}</span>
              </div>
            )}
            {order.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Адрес:</span>
                <span>{order.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Товары</h3>
        <div className="mt-3 rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Товар</th>
                <th className="px-4 py-2 text-right">Цена</th>
                <th className="px-4 py-2 text-right">Кол-во</th>
                <th className="px-4 py-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-right">{item.price.toLocaleString()} ₽</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{(item.price * item.quantity).toLocaleString()} ₽</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right font-medium">
                  Итого:
                </td>
                <td className="px-4 py-2 text-right font-medium">{order.total.toLocaleString()} ₽</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Статус заказа</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((statusOption) => (
                <SelectItem key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Заметки</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Добавьте заметки к заказу"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Закрыть
        </Button>
        <Button onClick={handleUpdateOrder} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить изменения"
          )}
        </Button>
      </div>
    </div>
  )
}
