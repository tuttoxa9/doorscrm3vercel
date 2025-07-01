"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/firebase-config"
import { useAuth } from "@/lib/firebase/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()
  const { user, userData } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      onOpenChange(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getUserInitials = () => {
    if (userData?.displayName) {
      return userData.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b p-4">
            <SheetTitle>
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => onOpenChange(false)}>
                <span className="text-xl font-bold">MAESTRO</span>
                <span className="text-sm text-muted-foreground">Admin</span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {userData?.displayName || user?.email?.split("@")[0] || "Пользователь"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userData?.role === "admin" ? "Администратор" : "Менеджер"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
