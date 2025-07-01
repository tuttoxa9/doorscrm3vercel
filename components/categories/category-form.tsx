"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CategoryFormProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string
    order: number
  } | null
  onSuccess: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      order: category?.order || 0,
    },
  })

  // Watch the name field to generate slug
  const name = watch("name")

  // Generate slug from name
  const generateSlug = () => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/--+/g, "-") // Replace multiple - with single -
      .trim()

    setValue("slug", slug)
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const categoryData = {
        ...data,
        order: Number(data.order),
        updatedAt: new Date(),
      }

      if (category) {
        // Update existing category
        await updateDoc(doc(db, "categories", category.id), categoryData)
        toast({
          title: "Успешно",
          description: "Категория обновлена",
        })
      } else {
        // Add new category
        categoryData.createdAt = new Date()
        await addDoc(collection(db, "categories"), categoryData)
        toast({
          title: "Успешно",
          description: "Категория добавлена",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить категорию",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название категории</Label>
          <Input
            id="name"
            {...register("name", { required: "Название обязательно" })}
            onChange={(e) => {
              register("name").onChange(e)
              if (!category) {
                // Only auto-generate for new categories
                generateSlug()
              }
            }}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">Slug (URL)</Label>
            {!category && (
              <Button type="button" variant="ghost" size="sm" onClick={generateSlug} className="h-8 text-xs">
                Сгенерировать из названия
              </Button>
            )}
          </div>
          <Input id="slug" {...register("slug", { required: "Slug обязателен" })} />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message as string}</p>}
          <p className="text-xs text-muted-foreground">Используется в URL адресе категории</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Порядок сортировки</Label>
          <Input id="order" type="number" {...register("order", { required: "Порядок обязателен" })} />
          {errors.order && <p className="text-sm text-destructive">{errors.order.message as string}</p>}
          <p className="text-xs text-muted-foreground">Категории с меньшим значением отображаются первыми</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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
