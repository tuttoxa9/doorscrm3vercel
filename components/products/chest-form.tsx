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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Upload, Plus } from "lucide-react"
import Image from "next/image"
import { type Chest, DEFAULT_COLORS, MATERIALS, HANDLE_TYPES } from "@/lib/types/product"

interface ChestFormProps {
  chest: Chest | null
  onSuccess: () => void
}

export function ChestForm({ chest, onSuccess }: ChestFormProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(chest?.images || [])
  const [colors, setColors] = useState<string[]>(chest?.colors || DEFAULT_COLORS)
  const [newColor, setNewColor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: chest?.name || "",
      material: chest?.material || "",
      handleType: chest?.handleType || "",
      price: chest?.price || 0,
      description: chest?.description || "",
      length: chest?.dimensions?.length || 0,
      width: chest?.dimensions?.width || 0,
      height: chest?.dimensions?.height || 0,
      drawerCount: chest?.drawerCount || 3,
      hasLock: chest?.hasLock ?? false,
      inStock: chest?.inStock ?? true,
      featured: chest?.featured ?? false,
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || images.length >= 5) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).slice(0, 5 - images.length).map(async (file) => {
        const storageRef = ref(storage, `komodi/${Date.now()}-${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        return getDownloadURL(snapshot.ref)
      })

      const urls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...urls])
      toast({
        title: "Изображения загружены",
        description: `Загружено ${urls.length} изображений`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображения",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (url: string) => {
    try {
      const imageRef = ref(storage, url)
      await deleteObject(imageRef)
      setImages(prev => prev.filter(img => img !== url))
      toast({
        title: "Изображение удалено",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить изображение",
        variant: "destructive",
      })
    }
  }

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors(prev => [...prev, newColor.trim()])
      setNewColor("")
    }
  }

  const removeColor = (color: string) => {
    setColors(prev => prev.filter(c => c !== color))
  }

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одно изображение",
        variant: "destructive",
      })
      return
    }

    if (colors.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы один цвет",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const chestData: Omit<Chest, "id"> = {
        name: data.name,
        material: "Дерево",
        handleType: "Круглые ручки",
        price: Number(data.price),
        description: data.description,
        dimensions: {
          length: 80,
          width: 40,
          height: 90,
        },
        drawerCount: 3, // значение по умолчанию
        hasLock: data.hasLock,
        colors,
        images,
        inStock: data.inStock,
        featured: data.featured,
        createdAt: chest?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      if (chest) {
        await updateDoc(doc(db, "komodi", chest.id), chestData)
        toast({
          title: "Комод обновлен",
          description: "Данные комода успешно обновлены",
        })
      } else {
        await addDoc(collection(db, "komodi"), chestData)
        toast({
          title: "Комод добавлен",
          description: "Новый комод успешно добавлен в каталог",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving chest:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить комод",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название комода *</Label>
          <Input
            id="name"
            {...register("name", { required: "Название обязательно" })}
            placeholder="Например: Комод Классик"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>




      </div>



      {/* Цена */}
      <div className="space-y-2">
        <Label htmlFor="price">Цена (BYN) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register("price", {
            required: "Цена обязательна",
            min: { value: 0, message: "Цена не может быть отрицательной" }
          })}
          placeholder="199.99"
        />
        {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
      </div>

      {/* Описание */}
      <div className="space-y-2">
        <Label htmlFor="description">Описание *</Label>
        <Textarea
          id="description"
          {...register("description", { required: "Описание обязательно" })}
          placeholder="Подробное описание комода..."
          rows={4}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Цвета */}
      <div className="space-y-2">
        <Label>Доступные цвета *</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {colors.map((color) => (
            <Badge key={color} variant="secondary" className="flex items-center gap-1">
              {color}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Добавить цвет"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
          />
          <Button type="button" onClick={addColor} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_COLORS.map((color) => (
            <Button
              key={color}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!colors.includes(color)) {
                  setColors(prev => [...prev, color])
                }
              }}
              disabled={colors.includes(color)}
            >
              {color}
            </Button>
          ))}
        </div>
      </div>

      {/* Изображения */}
      <div className="space-y-2">
        <Label>Изображения (максимум 5) *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`Изображение ${index + 1}`}
                width={150}
                height={150}
                className="rounded-lg object-cover w-full h-32"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors h-32 flex flex-col items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Загрузить</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {uploading && <p className="text-sm text-blue-500">Загрузка изображений...</p>}
      </div>

      {/* Переключатели */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="hasLock" {...register("hasLock")} defaultChecked={chest?.hasLock ?? false} />
          <Label htmlFor="hasLock">Есть замок</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="inStock" {...register("inStock")} defaultChecked={chest?.inStock ?? true} />
          <Label htmlFor="inStock">В наличии</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="featured" {...register("featured")} defaultChecked={chest?.featured ?? false} />
          <Label htmlFor="featured">Популярный товар</Label>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {chest ? "Обновление..." : "Добавление..."}
            </>
          ) : (
            chest ? "Обновить комод" : "Добавить комод"
          )}
        </Button>
      </div>
    </form>
  )
}
