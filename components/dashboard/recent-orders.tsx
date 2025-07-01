import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Order {
  id: string
  name: string
  phone: string
  status: string
  createdAt: any
  total: number
}

interface RecentOrdersProps {
  orders: Order[]
}

const ORDER_STATUSES = {
  new: "Новый",
  processing: "В обработке",
  completed: "Выполнен",
  cancelled: "Отменен",
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
    case "processing":
      return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
    case "completed":
      return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
    case "cancelled":
      return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
    default:
      return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
  }
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние заказы</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{order.name}</p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-2">
                  <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                    {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || "Новый"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{order.total.toLocaleString()} BYN</p>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt && order.createdAt.toDate
                        ? format(order.createdAt.toDate(), "d MMM", { locale: ru })
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <Link href={`/orders?id=${order.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">Нет заказов</div>
        )}

        {orders.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Link href="/orders">
              <Button variant="outline">Все заказы</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
