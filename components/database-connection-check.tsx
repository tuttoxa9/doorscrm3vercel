"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RefreshCw, Database, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatus {
  status: "connected" | "disconnected" | "checking"
  message: string
  lastChecked?: Date
}

export function DatabaseConnectionCheck() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: "checking",
    message: "Проверка подключения...",
  })

  const checkConnection = async () => {
    setConnectionStatus({
      status: "checking",
      message: "Проверка подключения...",
    })

    try {
      // Попытка выполнить простой запрос к базе данных
      const testQuery = query(collection(db, "products"), limit(1))
      await getDocs(testQuery)

      setConnectionStatus({
        status: "connected",
        message: "Подключение к базе данных активно",
        lastChecked: new Date(),
      })
    } catch (error) {
      console.error("Database connection error:", error)
      setConnectionStatus({
        status: "disconnected",
        message: "Ошибка подключения к базе данных",
        lastChecked: new Date(),
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case "connected":
        return <Wifi className="h-5 w-5 text-green-500" />
      case "disconnected":
        return <WifiOff className="h-5 w-5 text-red-500" />
      case "checking":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Подключено
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Отключено
          </Badge>
        )
      case "checking":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Проверка...
          </Badge>
        )
    }
  }

  const getCardClass = () => {
    switch (connectionStatus.status) {
      case "connected":
        return "border-green-200 bg-green-50/50"
      case "disconnected":
        return "border-red-200 bg-red-50/50"
      case "checking":
        return "border-blue-200 bg-blue-50/50"
      default:
        return ""
    }
  }

  return (
    <Card className={cn("transition-all duration-500", getCardClass())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Состояние базы данных
        </CardTitle>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{connectionStatus.message}</p>

          {connectionStatus.lastChecked && (
            <p className="text-xs text-muted-foreground">
              Последняя проверка: {connectionStatus.lastChecked.toLocaleTimeString()}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={connectionStatus.status === "checking"}
              className="transition-all duration-200"
            >
              {connectionStatus.status === "checking" ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Проверить подключение
            </Button>

            {connectionStatus.status === "connected" && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Онлайн
              </div>
            )}
          </div>

          {/* Анимированный индикатор статуса */}
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div
              className={cn(
                "h-1 rounded-full transition-all duration-1000",
                connectionStatus.status === "connected" && "w-full bg-green-500",
                connectionStatus.status === "disconnected" && "w-full bg-red-500",
                connectionStatus.status === "checking" && "w-1/2 bg-blue-500 animate-pulse",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
