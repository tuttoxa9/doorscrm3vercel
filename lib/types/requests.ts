export interface ContactRequest {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  source: string // 'website', 'phone', 'manual'
  createdAt: any
  status: 'new' | 'contacted' | 'converted' | 'closed'
}

export interface Order {
  id: string
  name: string
  phone: string
  status: 'new' | 'processed' | 'in_production' | 'shipping' | 'completed' | 'cancelled'
  createdAt: any
  items: OrderItem[]
  total: number
  notes?: string
  fromRequestId?: string // Если заказ создан из заявки
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  description?: string
  isCustom: boolean // true для мебели на заказ, false для товаров из БД
  productId?: string // ID товара из БД, если не кастомный
}

export const ORDER_STATUSES = {
  new: "Новый",
  processed: "Обработан",
  in_production: "В производстве",
  shipping: "На доставке",
  completed: "Завершён",
  cancelled: "Отменён",
} as const

export const CONTACT_REQUEST_STATUSES = {
  new: "Новая",
  contacted: "Связались",
  converted: "Конвертирована",
  closed: "Закрыта",
} as const
