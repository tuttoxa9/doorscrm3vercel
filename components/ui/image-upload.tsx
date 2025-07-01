"use client"

import { useState, useRef } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, setDoc } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { storage, db, auth } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Upload, Star, Loader2, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onSuccess?: () => void
  inDock?: boolean
}

export function ImageUpload({ onSuccess, inDock = false }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Генерация уникального ID продукта
  const generateProductId = () => {
    return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Валидация файла
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Неподдерживаемый формат файла. Используйте JPG, JPEG, PNG или WEBP")
      return false
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой. Максимальный размер: 5MB")
      return false
    }

    return true
  }

  // Обработка выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  // Обработка файлов
  const handleFiles = (files: FileList) => {
    if (files && files[0]) {
      const selectedFile = files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    handleFiles(files)
  }

  // Клик по области для выбора файла
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // Удаление выбранного файла
  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Выберите файл для загрузки")
      return
    }

    setUploading(true)

    try {
      // Сначала выполняем анонимную аутентификацию
      console.log('Выполняем анонимную аутентификацию...')
      const userCredential = await signInAnonymously(auth)
      console.log('Анонимная аутентификация успешна:', userCredential.user.uid)

      // Генерируем уникальный ID продукта
      const productId = generateProductId()

      // Создаем уникальное имя файла
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const storageRef = ref(storage, `products/${productId}/${fileName}`)

      // Подготавливаем метаданные для файла
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploadedBy': userCredential.user.uid,
          'originalName': file.name,
          'productId': productId
        }
      }

      console.log('Начинаем загрузку файла:', fileName)
      console.log('Метаданные:', metadata)
      console.log('User ID:', userCredential.user.uid)

      // Загружаем файл с метаданными
      const uploadResult = await uploadBytes(storageRef, file, metadata)
      console.log('Файл успешно загружен:', uploadResult)

      // Получаем URL загруженного файла
      const downloadURL = await getDownloadURL(storageRef)
      console.log('URL получен:', downloadURL)

      // Создаем новый документ продукта в Firestore
      const productRef = doc(db, "products", productId)
      const productData = {
        id: productId,
        name: `Продукт ${new Date().toLocaleDateString()}`,
        images: [downloadURL],
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        uploadedBy: userCredential.user.uid
      }

      console.log('Сохраняем в Firestore:', productData)
      await setDoc(productRef, productData)

      toast.success(`Изображение успешно загружено! ID продукта: ${productId}`)

      // Сброс формы
      setFile(null)
      setOpen(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Детальная ошибка загрузки:", error)
      console.error("Код ошибки:", error.code)
      console.error("Сообщение ошибки:", error.message)

      // Более детальная обработка различных типов ошибок
      let errorMessage = "Ошибка при загрузке изображения"

      if (error.code === 'storage/unauthorized') {
        errorMessage = "Нет доступа к хранилищу. Проверьте правила безопасности Firebase."
      } else if (error.code === 'storage/canceled') {
        errorMessage = "Загрузка была отменена"
      } else if (error.code === 'storage/unknown') {
        errorMessage = "Неизвестная ошибка Firebase Storage. Проверьте правила безопасности и конфигурацию проекта."
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = "Превышена квота хранилища"
      } else if (error.code === 'storage/invalid-format') {
        errorMessage = "Неверный формат файла"
      } else if (error.code === 'storage/invalid-argument') {
        errorMessage = "Неверные аргументы для загрузки"
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Анонимная аутентификация отключена в Firebase"
      }

      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={inDock ? "sm" : "icon"}
          title={inDock ? undefined : "Загрузить изображение"}
          className={inDock ? "h-5 w-5 p-0 border-0 bg-transparent shadow-none hover:bg-transparent" : ""}
        >
          <Star className={`${inDock ? "h-4 w-4" : "h-4 w-4"} text-muted-foreground`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Загрузить изображение продукта</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              file && "border-green-500 bg-green-50 dark:bg-green-950/20"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div className="space-y-2">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragOver ? "Отпустите файл здесь" : "Перетащите изображение сюда"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    или нажмите для выбора файла
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, JPEG, PNG, WEBP • Макс. 5MB • Рекомендуется 800x600px+
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <p className="font-medium mb-1">Автоматическая настройка:</p>
            <p>• ID продукта будет сгенерирован автоматически</p>
            <p>• Изображение будет помечено как featured для показа в "Популярных решениях"</p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Загрузка..." : "Загрузить изображение"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
