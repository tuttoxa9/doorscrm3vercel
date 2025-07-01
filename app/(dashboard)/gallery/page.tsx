"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GalleryForm } from "@/components/gallery/gallery-form"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search, Edit, Trash2 } from "lucide-react"
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

interface GalleryItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  category?: string
  order: number
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<GalleryItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const fetchGalleryItems = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"))
      const galleryData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryItem[]

      // Sort by order field
      galleryData.sort((a, b) => a.order - b.order)

      setGalleryItems(galleryData)
    } catch (error) {
      console.error("Error fetching gallery items:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить галерею",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const handleEdit = (item: GalleryItem) => {
    setCurrentItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteDoc(doc(db, "gallery", itemToDelete))
      toast({
        title: "Успешно",
        description: "Элемент галереи был удален",
      })
      fetchGalleryItems()
    } catch (error) {
      console.error("Error deleting gallery item:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить элемент галереи",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const confirmDelete = (itemId: string) => {
    setItemToDelete(itemId)
    setIsDeleteDialogOpen(true)
  }

  const filteredItems = galleryItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Галерея</h1>
          <p className="text-muted-foreground">Управление галереей работ</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Очистить все
          </Button>
          <Button
            onClick={() => {
              setCurrentItem(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Добавить работу
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск в галерее..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg border bg-card">
                <div className="aspect-square relative">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => confirmDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.category && <p className="text-sm text-muted-foreground">{item.category}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex h-[200px] items-center justify-center text-muted-foreground">
              {searchQuery ? "Элементы галереи не найдены" : "Галерея пуста"}
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Редактировать элемент галереи" : "Добавить в галерею"}</DialogTitle>
            <DialogDescription>
              {currentItem ? "Измените информацию и нажмите Сохранить" : "Загрузите изображение и заполните информацию"}
            </DialogDescription>
          </DialogHeader>
          <GalleryForm
            item={currentItem}
            onSuccess={() => {
              setIsDialogOpen(false)
              fetchGalleryItems()
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Элемент будет удален из галереи.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BulkDeleteDialog
        isOpen={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        collectionName="gallery"
        title="Удалить всю галерею"
        description="Это действие удалит все изображения из галереи."
        onSuccess={fetchGalleryItems}
      />
    </div>
  )
}
