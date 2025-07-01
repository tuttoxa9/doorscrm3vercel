"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/firebase-config"
import { useAuth } from "@/lib/firebase/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Package2,
  FolderOpen,
  ShoppingBag,
  Images,
  Users2,
  Settings2,
  LogOut,
  ChevronDown,
  FolderSyncIcon as Sync,
  ChevronLeft,
  ChevronRight,
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

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, userData } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
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
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">MAESTRO</span>
            <span className="text-sm text-muted-foreground">Admin</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle and Image Upload */}
      <div className="p-2">
        <div className={cn("flex gap-2", collapsed ? "justify-center flex-col" : "justify-end")}>
          <ImageUpload />
          <ThemeToggle />
        </div>
      </div>

      {/* User Menu */}
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-3 h-auto p-2", collapsed && "justify-center px-2")}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {userData?.displayName || user?.email?.split("@")[0] || "Пользователь"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userData?.role === "admin" ? "Администратор" : "Менеджер"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{userData?.displayName || "Пользователь"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/data-sync">
                <Sync className="mr-2 h-4 w-4" />
                <span>Синхронизация</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings2 className="mr-2 h-4 w-4" />
                <span>Настройки</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
