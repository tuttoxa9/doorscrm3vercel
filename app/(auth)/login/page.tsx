"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/firebase-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"

const Aurora = dynamic(() => import("@/components/ui/aurora"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
})

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(
        error.code === "auth/invalid-credential"
          ? "Неверный email или пароль"
          : "Ошибка при входе. Пожалуйста, попробуйте снова.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !isLoading) {
      handleLogin()
    }
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* Анимированный фон */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#1f2937", "#374151", "#1f2937"]}
          amplitude={0.8}
          blend={0.6}
        />
      </div>

      {/* Форма входа */}
      <Card className="relative z-10 w-full max-w-md backdrop-blur-sm bg-black/90 border border-neutral-800/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">MAESTRO Admin</CardTitle>
          <CardDescription>Войдите в административную консоль</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                autoFocus
                className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-neutral-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-neutral-500"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700" onClick={handleLogin} disabled={isLoading || !email || !password}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
