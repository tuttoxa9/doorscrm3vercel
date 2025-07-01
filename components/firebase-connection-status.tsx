"use client"

import { useState, useEffect } from "react"
import { connectStorageEmulator, getStorage } from "firebase/storage"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { ref, listAll } from "firebase/storage"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { storage, db } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface ConnectionStatus {
  storage: 'connecting' | 'connected' | 'error'
  firestore: 'connecting' | 'connected' | 'error'
  storageError?: string
  firestoreError?: string
}

export function FirebaseConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    storage: 'connecting',
    firestore: 'connecting'
  })
  const [isVisible, setIsVisible] = useState(false)

  const checkConnections = async () => {
    setStatus({
      storage: 'connecting',
      firestore: 'connecting'
    })

    // Проверка Storage
    try {
      const storageRef = ref(storage, 'products')
      await listAll(storageRef)
      setStatus(prev => ({ ...prev, storage: 'connected', storageError: undefined }))
    } catch (error: any) {
      console.error('Storage connection error:', error)
      setStatus(prev => ({
        ...prev,
        storage: 'error',
        storageError: error.message || 'Unknown storage error'
      }))
    }

    // Проверка Firestore
    try {
      const productsRef = collection(db, 'products')
      const q = query(productsRef, limit(1))
      await getDocs(q)
      setStatus(prev => ({ ...prev, firestore: 'connected', firestoreError: undefined }))
    } catch (error: any) {
      console.error('Firestore connection error:', error)
      setStatus(prev => ({
        ...prev,
        firestore: 'error',
        firestoreError: error.message || 'Unknown firestore error'
      }))
    }
  }

  useEffect(() => {
    checkConnections()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Подключено</Badge>
      case 'error':
        return <Badge variant="destructive">Ошибка</Badge>
      case 'connecting':
        return <Badge variant="secondary">Подключение...</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Проверить Firebase
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Статус Firebase</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.storage)}
            <span className="text-sm">Storage</span>
          </div>
          {getStatusBadge(status.storage)}
        </div>

        {status.storageError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {status.storageError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.firestore)}
            <span className="text-sm">Firestore</span>
          </div>
          {getStatusBadge(status.firestore)}
        </div>

        {status.firestoreError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {status.firestoreError}
          </div>
        )}

        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnections}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить статус
          </Button>
        </div>

        {(status.storage === 'error' || status.firestore === 'error') && (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Возможные решения:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Проверьте правила безопасности Firebase</li>
                <li>• Убедитесь что Storage включен в проекте</li>
                <li>• Проверьте настройки CORS</li>
                <li>• Проверьте квоты проекта</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => window.open('/fix-firebase', '_blank')}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Исправить ошибку Firebase
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
