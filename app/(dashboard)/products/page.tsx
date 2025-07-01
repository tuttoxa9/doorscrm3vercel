"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductForm } from "@/components/products/product-form"
import { TableForm } from "@/components/products/table-form"
import { ShelfForm } from "@/components/products/shelf-form"
import { ChestForm } from "@/components/products/chest-form"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search, Edit, Trash2, Star, Package } from "lucide-react"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BulkDeleteDialog } from "@/components/data-management/bulk-delete-dialog"
import type { Product, Table, Shelf, Chest } from "@/lib/types/product"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [chests, setChests] = useState<Chest[]>([])

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("doors")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [currentTable, setCurrentTable] = useState<Table | null>(null)
  const [currentShelf, setCurrentShelf] = useState<Shelf | null>(null)
  const [currentChest, setCurrentChest] = useState<Chest | null>(null)

  const [itemToDelete, setItemToDelete] = useState<{ id: string; collection: string } | null>(null)
  const [dialogType, setDialogType] = useState<"doors" | "tables" | "shelves" | "chests">("doors")

  const { toast } = useToast()

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [productsSnap, tablesSnap, shelvesSnap, chestsSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "tables")),
        getDocs(collection(db, "polki")),
        getDocs(collection(db, "komodi"))
      ])

      const productsData = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      const tablesData = tablesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Table[]

      const shelvesData = shelvesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shelf[]

      const chestsData = chestsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chest[]

      setProducts(productsData)
      setTables(tablesData)
      setShelves(shelvesData)
      setChests(chestsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteDoc(doc(db, itemToDelete.collection, itemToDelete.id))
      toast({
        title: "Товар удален",
        description: "Товар успешно удален из каталога",
      })
      fetchAllData()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const openAddDialog = (type: typeof dialogType) => {
    setDialogType(type)
    setCurrentProduct(null)
    setCurrentTable(null)
    setCurrentShelf(null)
    setCurrentChest(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: any, type: typeof dialogType) => {
    setDialogType(type)
    if (type === "doors") setCurrentProduct(item)
    else if (type === "tables") setCurrentTable(item)
    else if (type === "shelves") setCurrentShelf(item)
    else if (type === "chests") setCurrentChest(item)
    setIsDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsDialogOpen(false)
    fetchAllData()
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} BYN`
  }

  const ItemCard = ({ item, type, onEdit, onDelete }: {
    item: any,
    type: string,
    onEdit: () => void,
    onDelete: () => void
  }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
            {item.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-sm">{formatPrice(item.price)}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {item.images && item.images.length > 0 && (
          <div className="relative h-32 mb-3 overflow-hidden rounded-md">
            <Image
              src={item.images[0]}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

        {/* Специфичные поля для каждого типа */}
        {type === "tables" && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Материал: {item.material}</p>
            <p>Форма: {item.shape}</p>
            <p>Мест: {item.seatingCapacity}</p>
          </div>
        )}
        {type === "shelves" && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Материал: {item.material}</p>
            <p>Крепление: {item.mountType}</p>
            <p>Полок: {item.shelfCount}</p>
          </div>
        )}
        {type === "chests" && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Материал: {item.material}</p>
            <p>Ящиков: {item.drawerCount}</p>
            {item.hasLock && <p>С замком</p>}
          </div>
        )}
        {type === "doors" && item.category && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Категория: {item.category}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {item.colors?.slice(0, 3).map((color: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {color}
            </Badge>
          ))}
          {item.colors?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.colors.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <Badge variant={item.inStock ? "secondary" : "destructive"} className="text-xs">
            {item.inStock ? "В наличии" : "Нет в наличии"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.material.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredShelves = shelves.filter((shelf) =>
    shelf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shelf.material.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredChests = chests.filter((chest) =>
    chest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chest.material.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Каталог товаров</h1>
          <p className="text-muted-foreground">Управление всеми товарами в едином каталоге</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Очистить все
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск товаров..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="doors" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Шкафы ({products.length})
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Столы ({tables.length})
          </TabsTrigger>
          <TabsTrigger value="shelves" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Полки ({shelves.length})
          </TabsTrigger>
          <TabsTrigger value="chests" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Комоды ({chests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Шкафы</h2>
            <Button onClick={() => openAddDialog("doors")}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить шкаф
            </Button>
          </div>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ItemCard
                  key={product.id}
                  item={product}
                  type="doors"
                  onEdit={() => openEditDialog(product, "doors")}
                  onDelete={() => {
                    setItemToDelete({ id: product.id, collection: "products" })
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))}
              {filteredProducts.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchQuery ? "Нет товаров, соответствующих поиску" : "Пока нет шкафов в каталоге"}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Столы</h2>
            <Button onClick={() => openAddDialog("tables")}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить стол
            </Button>
          </div>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTables.map((table) => (
                <ItemCard
                  key={table.id}
                  item={table}
                  type="tables"
                  onEdit={() => openEditDialog(table, "tables")}
                  onDelete={() => {
                    setItemToDelete({ id: table.id, collection: "tables" })
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))}
              {filteredTables.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchQuery ? "Нет столов, соответствующих поиску" : "Пока нет столов в каталоге"}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shelves" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Полки</h2>
            <Button onClick={() => openAddDialog("shelves")}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить полку
            </Button>
          </div>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredShelves.map((shelf) => (
                <ItemCard
                  key={shelf.id}
                  item={shelf}
                  type="shelves"
                  onEdit={() => openEditDialog(shelf, "shelves")}
                  onDelete={() => {
                    setItemToDelete({ id: shelf.id, collection: "polki" })
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))}
              {filteredShelves.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchQuery ? "Нет полок, соответствующих поиску" : "Пока нет полок в каталоге"}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Комоды</h2>
            <Button onClick={() => openAddDialog("chests")}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить комод
            </Button>
          </div>
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredChests.map((chest) => (
                <ItemCard
                  key={chest.id}
                  item={chest}
                  type="chests"
                  onEdit={() => openEditDialog(chest, "chests")}
                  onDelete={() => {
                    setItemToDelete({ id: chest.id, collection: "komodi" })
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))}
              {filteredChests.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchQuery ? "Нет комодов, соответствующих поиску" : "Пока нет комодов в каталоге"}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Модальные окна для добавления/редактирования */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "doors" && (currentProduct ? "Редактировать шкаф" : "Добавить шкаф")}
              {dialogType === "tables" && (currentTable ? "Редактировать стол" : "Добавить стол")}
              {dialogType === "shelves" && (currentShelf ? "Редактировать полку" : "Добавить полку")}
              {dialogType === "chests" && (currentChest ? "Редактировать комод" : "Добавить комод")}
            </DialogTitle>
            <DialogDescription>
              Заполните форму для {currentProduct || currentTable || currentShelf || currentChest ? "обновления" : "добавления"} товара в каталог
            </DialogDescription>
          </DialogHeader>

          {dialogType === "doors" && (
            <ProductForm product={currentProduct} onSuccess={handleFormSuccess} />
          )}
          {dialogType === "tables" && (
            <TableForm table={currentTable} onSuccess={handleFormSuccess} />
          )}
          {dialogType === "shelves" && (
            <ShelfForm shelf={currentShelf} onSuccess={handleFormSuccess} />
          )}
          {dialogType === "chests" && (
            <ChestForm chest={currentChest} onSuccess={handleFormSuccess} />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Товар будет безвозвратно удален из каталога.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог массового удаления */}
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={() => {
          // Реализация массового удаления
          setBulkDeleteOpen(false)
          fetchAllData()
        }}
        itemType="товаров"
      />
    </div>
  )
}
