"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface GalleryFormProps {
  item: {
    id: string
    title: string
    description?: string
    imageUrl: string
    category?: string
    order: number
  } | null
  onSuccess: () => void
}

export function GalleryForm({ item, onSuccess }: GalleryFormProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(item?.imageUrl || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      category: item?.category || "",
      order: item?.order || 0,
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // If there's an existing image, delete it first
      if (imageUrl && imageUrl.includes("firebase")) {
        try {
          const oldImageRef = ref(storage, imageUrl)
          await deleteObject(oldImageRef)
        } catch (error) {
          console.error("Error deleting old image:", error)
        }
      }

      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      setImageUrl(downloadURL)
      toast({
        title: "Успешно",
        description: "Изображение загружено",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      if (imageUrl && imageUrl.includes("firebase")) {
        try {
          const imageRef = ref(storage, imageUrl)
          await deleteObject(imageRef)
        } catch (error) {
          console.error("Error deleting image from storage:", error)
        }
      }

      setImageUrl("")
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить изображение",
      })
    }
  }

  const onSubmit = async (data: any) => {
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо загрузить изображение",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const galleryData = {
        ...data,
        imageUrl,
        order: Number(data.order),
        updatedAt: new Date(),
      }

      if (item) {
        // Update existing gallery item
        await updateDoc(doc(db, "gallery", item.id), galleryData)
        toast({
          title: "Успешно",
          description: "Элемент галереи обновлен",
        })
      } else {
        // Add new gallery item
        galleryData.createdAt = new Date()
        await addDoc(collection(db, "gallery"), galleryData)
        toast({
          title: "Успешно",
          description: "Элемент добавлен в галерею",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving gallery item:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить элемент галереи",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Изображение</Label>
          {imageUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <Image src={imageUrl || "/placeholder.svg"} alt="Gallery image" fill className="object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/25 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Загрузить изображение</span>
                  </>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
          {!imageUrl && <p className="text-sm text-destructive">Необходимо загрузить изображение</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input id="title" {...register("title", { required: "Название обязательно" })} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <Input id="category" {...register("category")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Порядок сортировки</Label>
          <Input id="order" type="number" {...register("order", { required: "Порядок обязателен" })} />
          {errors.order && <p className="text-sm text-destructive">{errors.order.message as string}</p>}
          <p className="text-xs text-muted-foreground">Элементы с меньшим значением отображаются первыми</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting || !imageUrl}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </div>
    </form>
  )
}
