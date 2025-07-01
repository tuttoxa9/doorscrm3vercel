"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Package } from "lucide-react"
import { OrderItem } from "@/lib/types/requests"

interface Product {
  id: string
  name: string
  price: number
  category: string
  description?: string
}

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Данные клиента
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")

  // Добавление товаров
  const [selectedProductId, setSelectedProductId] = useState("")
  const [customItemName, setCustomItemName] = useState("")
  const [customItemDescription, setCustomItemDescription] = useState("")
  const [customItemPrice, setCustomItemPrice] = useState("")
  const [itemQuantity, setItemQuantity] = useState("1")

  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchProducts()
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setOrderItems([])
    setCustomerName("")
    setCustomerPhone("")
    setNotes("")
    setSelectedProductId("")
    setCustomItemName("")
    setCustomItemDescription("")
    setCustomItemPrice("")
    setItemQuantity("1")
  }

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "products"), orderBy("name")))
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const addProductToOrder = () => {
    const selectedProduct = products.find(p => p.id === selectedProductId)
    const quantity = parseInt(itemQuantity)

    if (selectedProduct && quantity > 0) {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        name: selectedProduct.name,
        quantity: quantity,
        price: selectedProduct.price,
        description: selectedProduct.description,
        isCustom: false,
        productId: selectedProduct.id
      }

      setOrderItems([...orderItems, newItem])
      setSelectedProductId("")
      setItemQuantity("1")
    }
  }

  const addCustomItemToOrder = () => {
    const price = parseFloat(customItemPrice)
    const quantity = parseInt(itemQuantity)

    if (customItemName && price > 0 && quantity > 0) {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        name: customItemName,
        quantity: quantity,
        price: price,
        description: customItemDescription,
        isCustom: true
      }

      setOrderItems([...orderItems, newItem])
      setCustomItemName("")
      setCustomItemDescription("")
      setCustomItemPrice("")
      setItemQuantity("1")
    }
  }

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCreateOrder = async () => {
    if (!customerName || !customerPhone || orderItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля и добавьте хотя бы один товар",
      })
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, "orders"), {
        name: customerName,
        phone: customerPhone,
        status: "new",
        createdAt: Timestamp.now(),
        items: orderItems,
        total: calculateTotal(),
        notes: notes
      })

      toast({
        title: "Успешно",
        description: "Заказ создан",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать заказ",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать заказ</DialogTitle>
          <DialogDescription>
            Создание нового заказа вручную
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Данные клиента */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Данные клиента</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя клиента *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Добавление товаров из БД */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Добавить товар из каталога</h3>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Товар</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
              </div>
              <Button onClick={addProductToOrder} disabled={!selectedProductId}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </div>
          </div>

          {/* Добавление кастомного товара */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Добавить мебель на заказ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  type="number"
                  min="0"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={customItemDescription}
                onChange={(e) => setCustomItemDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
              </div>
              <Button
                onClick={addCustomItemToOrder}
                disabled={!customItemName || !customItemPrice}
                className="col-span-3"
              >
                <Package className="mr-2 h-4 w-4" />
                Добавить мебель на заказ
              </Button>
            </div>
          </div>

          {/* Список добавленных товаров */}
          {orderItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Товары в заказе</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toLocaleString()}</TableCell>
                        <TableCell>{(item.price * item.quantity).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            item.isCustom
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {item.isCustom ? 'На заказ' : 'Из каталога'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  Итого: {calculateTotal().toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Примечания */}
          <div className="space-y-2">
            <Label>Примечания к заказу</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={loading || !customerName || !customerPhone || orderItems.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              "Создать заказ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
