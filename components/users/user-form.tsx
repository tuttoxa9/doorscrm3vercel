"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface UserFormProps {
  user: {
    id: string
    email: string
    displayName?: string
    role: string
  } | null
  onSuccess: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [role, setRole] = useState(user?.role || "manager")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: user?.email || "",
      displayName: user?.displayName || "",
      password: "",
    },
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (user) {
        // Update existing user
        await updateDoc(doc(db, "users", user.id), {
          displayName: data.displayName,
          role,
          updatedAt: new Date(),
        })

        toast({
          title: "Успешно",
          description: "Пользователь обновлен",
        })
      } else {
        // Create new user
        try {
          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
          const newUser = userCredential.user

          // Add user to Firestore
          await addDoc(collection(db, "users"), {
            id: newUser.uid,
            email: data.email,
            displayName: data.displayName,
            role,
            createdAt: new Date(),
          })

          toast({
            title: "Успешно",
            description: "Пользователь добавлен",
          })
        } catch (error: any) {
          console.error("Error creating user:", error)

          if (error.code === "auth/email-already-in-use") {
            toast({
              variant: "destructive",
              title: "Ошибка",
              description: "Пользователь с таким email уже существует",
            })
          } else {
            toast({
              variant: "destructive",
              title: "Ошибка",
              description: "Не удалось создать пользователя",
            })
          }

          setIsSubmitting(false)
          return
        }
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить пользователя",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email обязателен",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Некорректный email адрес",
              },
            })}
            disabled={!!user} // Disable email field for existing users
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
        </div>

        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "Пароль обязателен",
                minLength: {
                  value: 6,
                  message: "Пароль должен содержать минимум 6 символов",
                },
              })}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message as string}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="displayName">Имя пользователя</Label>
          <Input id="displayName" {...register("displayName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Роль</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Администратор</SelectItem>
              <SelectItem value="manager">Менеджер</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Администраторы имеют полный доступ ко всем функциям. Менеджеры имеют ограниченный доступ.
          </p>
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
