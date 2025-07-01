"use client"

import { ContactRequestsList } from "@/components/orders/contact-requests-list"
import { OrdersList } from "@/components/orders/orders-list"

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Заявки</h1>
        <p className="text-muted-foreground">Управление заявками на связь и заказами</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Заказы</h2>
          <OrdersList />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Заявки на связь</h2>
          <ContactRequestsList />
        </div>
      </div>
    </div>
  )
}
