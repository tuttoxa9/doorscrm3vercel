import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package2, ShoppingBag, Users2, Images } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    products: number
    orders: number
    users: number
    gallery: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Товары</CardTitle>
          <Package2 className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <div className="text-lg font-bold">{stats.products}</div>
          <p className="text-xs text-muted-foreground">Всего товаров в каталоге</p>
        </CardContent>
      </Card>

      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Заказы</CardTitle>
          <ShoppingBag className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <div className="text-lg font-bold">{stats.orders}</div>
          <p className="text-xs text-muted-foreground">Всего заказов с сайта</p>
        </CardContent>
      </Card>

      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Пользователи</CardTitle>
          <Users2 className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <div className="text-lg font-bold">{stats.users}</div>
          <p className="text-xs text-muted-foreground">Администраторов и менеджеров</p>
        </CardContent>
      </Card>

      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Галерея</CardTitle>
          <Images className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 pt-1">
          <div className="text-lg font-bold">{stats.gallery}</div>
          <p className="text-xs text-muted-foreground">Работ в галерее</p>
        </CardContent>
      </Card>
    </div>
  )
}
