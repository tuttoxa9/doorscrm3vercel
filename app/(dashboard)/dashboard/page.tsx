"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    gallery: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch collection counts
        const productsSnapshot = await getDocs(collection(db, "products"))
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        const usersSnapshot = await getDocs(collection(db, "users"))
        const gallerySnapshot = await getDocs(collection(db, "gallery"))

        // Fetch recent orders
        const recentOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
        const recentOrdersData = recentOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setStats({
          products: productsSnapshot.size,
          orders: ordersSnapshot.size,
          users: usersSnapshot.size,
          gallery: gallerySnapshot.size,
        })

        setRecentOrders(recentOrdersData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-sm text-muted-foreground">Обзор данных и статистика вашего магазина</p>
      </div>

      <DashboardStats stats={stats} />

      <Tabs defaultValue="recent">
        <TabsList className="h-8">
          <TabsTrigger value="recent" className="text-sm">Последние заказы</TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">Аналитика</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-3 mt-3">
          <RecentOrders orders={recentOrders} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Аналитика</CardTitle>
              <CardDescription className="text-sm">Просмотр статистики и аналитических данных</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Аналитические данные будут доступны в ближайшее время</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
