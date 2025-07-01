"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderDetails } from "@/components/orders/order-details"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { BulkDeleteDialog } from "@/components/data-management/bulk-delete-dialog"

interface Order {
  id: string
  name: string
  phone: string
  email?: string
  status: string
  createdAt: any
  items: any[]
  total: number
  notes?: string
}

const ORDER_STATUSES = {
  new: "Новый",
  processing: "В обработке",
  completed: "Выполнен",
  cancelled: "Отменен",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const { toast } = useToast()
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))

      if (statusFilter) {
        ordersQuery = query(collection(db, "orders"), where("status", "==", statusFilter), orderBy("createdAt", "desc"))
      }

      const querySnapshot = await getDocs(ordersQuery)
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      setOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список заказов",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order)
    setIsDialogOpen(true)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "status-badge-new"
      case "processing":
        return "status-badge-processing"
      case "completed":
        return "status-badge-completed"
      case "cancelled":
        return "status-badge-cancelled"
      default:
        return "status-badge-new"
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Заказы</h1>
        <p className="text-muted-foreground">Управление заказами с сайта</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск заказов..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новый</SelectItem>
            <SelectItem value="processing">В обработке</SelectItem>
            <SelectItem value="completed">Выполнен</SelectItem>
            <SelectItem value="cancelled">Отменен</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => setBulkDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Очистить все
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.name}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.createdAt && order.createdAt.toDate
                        ? format(order.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: ru })
                        : "Дата не указана"}
                    </TableCell>
                    <TableCell>{order.total.toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || "Новый"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchQuery || statusFilter ? "Заказы не найдены" : "Нет заказов"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-background">
          <DialogHeader>
            <DialogTitle>Детали заказа</DialogTitle>
            <DialogDescription>Информация о заказе и управление статусом</DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <OrderDetails
              order={currentOrder}
              onSuccess={() => {
                setIsDialogOpen(false)
                fetchOrders()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <BulkDeleteDialog
        isOpen={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        collectionName="orders"
        title="Удалить все заказы"
        description="Это действие удалит все заказы с сайта."
        onSuccess={fetchOrders}
      />
    </div>
  )
}
