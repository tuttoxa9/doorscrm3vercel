"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContactRequestsList } from "@/components/orders/contact-requests-list"
import { OrdersList } from "@/components/orders/orders-list"

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("contact-requests")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Заявки</h1>
        <p className="text-muted-foreground">Управление заявками на связь и заказами</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact-requests">Заявки на связь</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
        </TabsList>

        <TabsContent value="contact-requests" className="space-y-4">
          <ContactRequestsList />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrdersList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
