"use client"

import { useState } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { ref, listAll, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase/firebase-config"
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
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trash2 } from "lucide-react"

interface BulkDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  collectionName: string
  title: string
  description: string
  onSuccess?: () => void
}

export function BulkDeleteDialog({
  isOpen,
  onOpenChange,
  collectionName,
  title,
  description,
  onSuccess,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [deletedCount, setDeletedCount] = useState(0)
  const { toast } = useToast()

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    setProgress(0)
    setDeletedCount(0)

    try {
      // Получаем все документы из коллекции
      const querySnapshot = await getDocs(collection(db, collectionName))
      const totalDocs = querySnapshot.size

      if (totalDocs === 0) {
        toast({
          title: "Информация",
          description: "Нет данных для удаления",
        })
        setIsDeleting(false)
        return
      }

      // Удаляем документы по одному с обновлением прогресса
      let deleted = 0
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnapshot.id))
        deleted++
        setDeletedCount(deleted)
        setProgress((deleted / totalDocs) * 100)
      }

      // Если это коллекция с изображениями, удаляем файлы из Storage
      if (collectionName === "products" || collectionName === "gallery") {
        try {
          const storageRef = ref(storage, collectionName)
          const listResult = await listAll(storageRef)

          for (const item of listResult.items) {
            await deleteObject(item)
          }
        } catch (storageError) {
          console.error("Error deleting storage files:", storageError)
          // Не показываем ошибку пользователю, так как основные данные удалены
        }
      }

      toast({
        title: "Успешно",
        description: `Удалено ${deleted} записей`,
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error during bulk delete:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить все данные",
      })
    } finally {
      setIsDeleting(false)
      setProgress(0)
      setDeletedCount(0)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2">
              <div>{description}</div>
              <div className="text-destructive font-medium">
                ⚠️ Это действие нельзя отменить. Все данные будут удалены безвозвратно.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isDeleting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Удаление данных...</span>
              <span>{deletedCount} удалено</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить все
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
