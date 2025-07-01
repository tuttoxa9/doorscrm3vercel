export interface Product {
  id: string
  name: string // Название товара
  category: string // Категория (вводится вручную)
  price: number // Цена (BYN)
  description: string // Описание
  colors: string[] // Доступные цвета
  images: string[] // Изображения (Firebase Storage)
  inStock: boolean // Наличие
  featured: boolean // Популярный товар
  createdAt: Date
  updatedAt: Date
}

// Базовый интерфейс для всех товаров
export interface BaseItem {
  id: string
  name: string
  price: number
  description: string
  colors: string[]
  images: string[]
  inStock: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// Столы
export interface Table extends BaseItem {
  material: string // Материал (дерево, стекло, металл)
  shape: string // Форма (круглый, прямоугольный, овальный)
  dimensions: {
    length: number // длина в см
    width: number // ширина в см
    height: number // высота в см
  }
  seatingCapacity: number // количество мест
}

// Полки
export interface Shelf extends BaseItem {
  material: string // Материал
  mountType: string // Тип крепления (настенная, напольная, угловая)
  dimensions: {
    length: number
    width: number
    height: number
  }
  shelfCount: number // количество полок
  maxWeight: number // максимальная нагрузка в кг
}

// Комоды
export interface Chest extends BaseItem {
  material: string // Материал
  drawerCount: number // количество ящиков
  dimensions: {
    length: number
    width: number
    height: number
  }
  handleType: string // Тип ручек
  hasLock: boolean // наличие замка
}

export const DEFAULT_COLORS = [
  "Белый",
  "Дуб сонома",
  "Венге магия",
  "Серый шифер",
]

export const MATERIALS = [
  "Дуб",
  "Сосна",
  "Береза",
  "МДФ",
  "ДСП",
  "Стекло",
  "Металл",
  "Пластик",
  "Ротанг",
  "Бамбук",
]

export const TABLE_SHAPES = [
  "Прямоугольный",
  "Круглый",
  "Овальный",
  "Квадратный",
  "Треугольный",
]

export const SHELF_MOUNT_TYPES = [
  "Настенная",
  "Напольная",
  "Угловая",
  "Подвесная",
  "Встроенная",
]

export const HANDLE_TYPES = [
  "Круглые ручки",
  "Планочные ручки",
  "Кнопки",
  "Врезные ручки",
  "Без ручек",
]
