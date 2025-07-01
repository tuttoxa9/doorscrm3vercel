"use client"

import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/firebase-config"
import { useAuth } from "@/lib/firebase/use-auth"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ImageUpload } from "@/components/ui/image-upload"
import DockOptimized, { DockItem } from "@/components/ui/dock-optimized"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import {
  Home,
  Package2,
  FolderOpen,
  ShoppingBag,
  Images,
  Users2,
  Settings2,
  LogOut,
  FolderSyncIcon as Sync,
  User,
} from "lucide-react"

const navItems = [
  {
    title: "Панель",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Товары",
    href: "/products",
    icon: Package2,
  },
  {
    title: "Категории",
    href: "/categories",
    icon: FolderOpen,
  },
  {
    title: "Заказы",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Галерея",
    href: "/gallery",
    icon: Images,
  },
  {
    title: "Пользователи",
    href: "/users",
    icon: Users2,
  },
  {
    title: "Синхронизация",
    href: "/data-sync",
    icon: Sync,
  },
  {
    title: "Настройки",
    href: "/settings",
    icon: Settings2,
  },
]

export function NavigationDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { isMobile } = useMobileDetection()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const dockItems: DockItem[] = [
    // Навигационные элементы
    ...navItems.map((item) => {
      const Icon = item.icon
      const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

      return {
        icon: <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />,
        label: item.title,
        onClick: () => router.push(item.href),
        className: isActive ? 'bg-primary/10 border-primary/20' : ''
      }
    }),

    // Разделитель (визуально)
    {
      icon: <div className="w-px h-6 bg-border" />,
      label: "",
      className: "cursor-default pointer-events-none"
    },

    // Загрузка изображений
    {
      icon: <ImageUpload inDock={true} />,
      label: "Загрузить изображение",
      className: "p-0 border-0 bg-transparent shadow-none"
    },

    // Переключатель темы
    {
      icon: <ThemeToggle inDock={true} />,
      label: "Сменить тему",
      className: "p-0 border-0 bg-transparent shadow-none"
    },

    // Профиль пользователя
    {
      icon: <User className="h-5 w-5 text-muted-foreground" />,
      label: user?.email?.split("@")[0] || "Профиль",
      onClick: () => router.push("/settings")
    },

    // Выход
    {
      icon: <LogOut className="h-5 w-5 text-destructive" />,
      label: "Выйти",
      onClick: handleSignOut,
      className: "hover:bg-destructive/10"
    },
  ]

  return (
    <DockOptimized
      items={dockItems}
      baseItemSize={isMobile ? 36 : 50}
      panelHeight={isMobile ? 50 : 64}
      magnification={isMobile ? 40 : 70}
    />
  )
}
