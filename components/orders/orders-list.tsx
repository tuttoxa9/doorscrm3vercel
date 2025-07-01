"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { BulkDeleteDialog } from "@/components/data-management/bulk-delete-dialog"
import { Order, ORDER_STATUSES } from "@/lib/types/requests"
import { OrderDetails } from "./order-details"
import { CreateOrderDialog } from "./create-order-dialog"

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const { toast } = useToast()

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))

      if (statusFilter && statusFilter !== "all") {
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus
      })

      toast({
        title: "Успешно",
        description: "Статус заказа обновлён",
      })

      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус заказа",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "processed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "in_production":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      case "shipping":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery),
  )

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
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
            <SelectItem value="processed">Обработан</SelectItem>
            <SelectItem value="in_production">В производстве</SelectItem>
            <SelectItem value="shipping">На доставке</SelectItem>
            <SelectItem value="completed">Завершён</SelectItem>
            <SelectItem value="cancelled">Отменён</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateOrderDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Создать заказ
        </Button>
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
                <TableHead>Клиент</TableHead>
                <TableHead>Дата заказа</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Товары</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewOrder(order)}>
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
                    <TableCell>{order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectTrigger className="w-[140px]">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                            {ORDER_STATUSES[order.status] || "Новый"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Новый</SelectItem>
                          <SelectItem value="processed">Обработан</SelectItem>
                          <SelectItem value="in_production">В производстве</SelectItem>
                          <SelectItem value="shipping">На доставке</SelectItem>
                          <SelectItem value="completed">Завершён</SelectItem>
                          <SelectItem value="cancelled">Отменён</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery || statusFilter ? "Заказы не найдены" : "Нет заказов"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Диалог просмотра заказа */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
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

      {/* Диалог создания заказа */}
      <CreateOrderDialog
        open={createOrderDialogOpen}
        onOpenChange={setCreateOrderDialogOpen}
        onSuccess={() => {
          setCreateOrderDialogOpen(false)
          fetchOrders()
        }}
      />

      {/* Диалог массового удаления */}
      <BulkDeleteDialog
        isOpen={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        collectionName="orders"
        title="Удалить все заказы"
        description="Это действие удалит все заказы."
        onSuccess={fetchOrders}
      />
    </>
  )
}
