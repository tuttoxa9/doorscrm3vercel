"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, ShoppingCart, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { BulkDeleteDialog } from "@/components/data-management/bulk-delete-dialog"
import { ContactRequest, CONTACT_REQUEST_STATUSES } from "@/lib/types/requests"
import { CreateOrderFromRequestDialog } from "./create-order-from-request-dialog"

export function ContactRequestsList() {
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<ContactRequest | null>(null)
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const { toast } = useToast()

  const fetchContactRequests = async () => {
    setLoading(true)
    try {
      let requestsQuery = query(collection(db, "contactRequests"), orderBy("createdAt", "desc"))

      if (statusFilter && statusFilter !== "all") {
        requestsQuery = query(collection(db, "contactRequests"), where("status", "==", statusFilter), orderBy("createdAt", "desc"))
      }

      const querySnapshot = await getDocs(requestsQuery)
      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactRequest[]

      setContactRequests(requestsData)
    } catch (error) {
      console.error("Error fetching contact requests:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список заявок на связь",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactRequests()
  }, [statusFilter])

  const handleViewRequest = (request: ContactRequest) => {
    setCurrentRequest(request)
    setIsDialogOpen(true)
  }

  const handleCreateOrderFromRequest = (request: ContactRequest) => {
    setCurrentRequest(request)
    setCreateOrderDialogOpen(true)
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "contactRequests", requestId), {
        status: newStatus
      })

      toast({
        title: "Успешно",
        description: "Статус заявки обновлён",
      })

      fetchContactRequests()
    } catch (error) {
      console.error("Error updating request status:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус заявки",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "converted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    }
  }

  const filteredRequests = contactRequests.filter(
    (request) =>
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery),
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
            <SelectItem value="new">Новая</SelectItem>
            <SelectItem value="contacted">Связались</SelectItem>
            <SelectItem value="converted">Конвертирована</SelectItem>
            <SelectItem value="closed">Закрыта</SelectItem>
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
                <TableHead>Клиент</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewRequest(request)}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-sm text-muted-foreground">{request.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.createdAt && request.createdAt.toDate
                        ? format(request.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: ru })
                        : "Дата не указана"}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{request.source}</span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectTrigger className="w-[140px]">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                            {CONTACT_REQUEST_STATUSES[request.status] || "Новая"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Новая</SelectItem>
                          <SelectItem value="contacted">Связались</SelectItem>
                          <SelectItem value="converted">Конвертирована</SelectItem>
                          <SelectItem value="closed">Закрыта</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreateOrderFromRequest(request)
                        }}
                        disabled={request.status === 'converted'}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery || statusFilter ? "Заявки не найдены" : "Нет заявок на связь"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Диалог просмотра заявки */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали заявки на связь</DialogTitle>
            <DialogDescription>Информация о заявке от клиента</DialogDescription>
          </DialogHeader>
          {currentRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Имя:</label>
                  <p className="text-sm text-muted-foreground">{currentRequest.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Телефон:</label>
                  <p className="text-sm text-muted-foreground">{currentRequest.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Источник:</label>
                  <p className="text-sm text-muted-foreground capitalize">{currentRequest.source}</p>
                </div>
              </div>
              {currentRequest.message && (
                <div>
                  <label className="text-sm font-medium">Сообщение:</label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentRequest.message}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Дата создания:</label>
                <p className="text-sm text-muted-foreground">
                  {currentRequest.createdAt && currentRequest.createdAt.toDate
                    ? format(currentRequest.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: ru })
                    : "Дата не указана"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог создания заказа из заявки */}
      <CreateOrderFromRequestDialog
        open={createOrderDialogOpen}
        onOpenChange={setCreateOrderDialogOpen}
        contactRequest={currentRequest}
        onSuccess={() => {
          setCreateOrderDialogOpen(false)
          fetchContactRequests()
        }}
      />

      {/* Диалог массового удаления */}
      <BulkDeleteDialog
        isOpen={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        collectionName="contactRequests"
        title="Удалить все заявки на связь"
        description="Это действие удалит все заявки на связь."
        onSuccess={fetchContactRequests}
      />
    </>
  )
}
