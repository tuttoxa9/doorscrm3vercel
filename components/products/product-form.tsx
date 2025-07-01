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
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Upload, Plus } from "lucide-react"
import Image from "next/image"
import { type Product, DEFAULT_COLORS } from "@/lib/types/product"

interface ProductFormProps {
  product: Product | null
  onSuccess: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [colors, setColors] = useState<string[]>(product?.colors || DEFAULT_COLORS)
  const [newColor, setNewColor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "",
      price: product?.price || 0,
      description: product?.description || "",
      inStock: product?.inStock ?? true,
      featured: product?.featured ?? false,
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newImages = [...images]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)

        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)

        newImages.push(downloadURL)
      }

      setImages(newImages)
      toast({
        title: "Успешно",
        description: "Изображения загружены",
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить изображения",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (url: string, index: number) => {
    try {
      if (url.includes("firebase")) {
        try {
          const imageRef = ref(storage, url)
          await deleteObject(imageRef)
        } catch (error) {
          console.error("Error deleting image from storage:", error)
        }
      }

      const newImages = [...images]
      newImages.splice(index, 1)
      setImages(newImages)
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить изображение",
      })
    }
  }

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()])
      setNewColor("")
    }
  }

  const handleRemoveColor = (colorToRemove: string) => {
    setColors(colors.filter((color) => color !== colorToRemove))
  }

  const handleAddDefaultColor = (color: string) => {
    if (!colors.includes(color)) {
      setColors([...colors, color])
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const productData = {
        name: data.name,
        category: data.category,
        price: Number(data.price),
        description: data.description,
        colors,
        images,
        inStock: data.inStock,
        featured: data.featured,
        updatedAt: new Date(),
      }

      if (product) {
        // Update existing product
        await updateDoc(doc(db, "products", product.id), productData)
        toast({
          title: "Успешно",
          description: "Товар обновлен",
        })
      } else {
        // Add new product
        const newProductData = {
          ...productData,
          createdAt: new Date(),
        }
        await addDoc(collection(db, "products"), newProductData)
        toast({
          title: "Успешно",
          description: "Товар добавлен",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить товар",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm">
              Название товара
            </Label>
            <Input id="name" className="h-8" {...register("name", { required: "Название обязательно" })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm">
              Категория
            </Label>
            <Input id="category" className="h-8" {...register("category", { required: "Категория обязательна" })} />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message as string}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="price" className="text-sm">
            Цена (BYN) *
          </Label>
          <Input
            id="price"
            type="number"
            className="h-8"
            {...register("price", { required: "Цена обязательна", min: 0 })}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="description" className="text-sm">
            Описание
          </Label>
          <Textarea id="description" rows={3} className="text-sm" {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Доступные цвета</Label>

          {/* Выбранные цвета */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {colors.map((color, index) => (
                <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                  {color}
                  <button type="button" onClick={() => handleRemoveColor(color)} className="hover:text-destructive">
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Добавление нового цвета */}
          <div className="flex gap-2">
            <Input
              placeholder="Добавить цвет"
              value={newColor}
              className="h-8 text-sm"
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Быстрый выбор цветов */}
          <div className="flex flex-wrap gap-1">
            {DEFAULT_COLORS.map((color) => (
              <Button
                key={color}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddDefaultColor(color)}
                disabled={colors.includes(color)}
                className="text-xs h-6 px-2"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch id="inStock" {...register("inStock")} defaultChecked={product?.inStock ?? true} />
            <Label htmlFor="inStock" className="text-sm">
              В наличии
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="featured" {...register("featured")} defaultChecked={product?.featured ?? false} />
            <Label htmlFor="featured" className="text-sm">
              Популярный
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Изображения</Label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, index) => (
              <div key={index} className="group relative aspect-square rounded border overflow-hidden">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url, index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}

            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded border border-dashed bg-muted/25 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center space-y-1 p-2 text-center">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Загрузить</span>
                  </>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onSuccess}>
          Отмена
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
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
