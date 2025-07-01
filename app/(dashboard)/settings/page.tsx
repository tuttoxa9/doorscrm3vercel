"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { DatabaseConnectionCheck } from "@/components/database-connection-check"
import { BulkDeleteDialog } from "@/components/data-management/bulk-delete-dialog"
import {
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  Database,
  Package2,
  FolderOpen,
  ShoppingBag,
  Images,
  Users2,
} from "lucide-react"

interface Settings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  workingHours: string
  socialLinks: {
    instagram?: string
    facebook?: string
    vk?: string
    telegram?: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
  }
  features: {
    enableOnlineOrders: boolean
    enableReviews: boolean
    enableNotifications: boolean
  }
  apiKeys: {
    yandexMaps?: string
    googleAnalytics?: string
  }
}

const defaultSettings: Settings = {
  siteName: "MAESTRO",
  siteDescription: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  workingHours: "",
  socialLinks: {},
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
  features: {
    enableOnlineOrders: true,
    enableReviews: false,
    enableNotifications: false,
  },
  apiKeys: {},
}

interface DataStats {
  products: number
  categories: number
  orders: number
  gallery: number
  users: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [dataStats, setDataStats] = useState<DataStats>({
    products: 0,
    categories: 0,
    orders: 0,
    gallery: 0,
    users: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    collection: string
    title: string
    description: string
  }>({
    isOpen: false,
    collection: "",
    title: "",
    description: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
    fetchDataStats()
  }, [])

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "main"))
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить настройки",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDataStats = async () => {
    try {
      const collections = ["products", "categories", "orders", "gallery", "users"]
      const stats: any = {}

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName))
        stats[collectionName] = snapshot.size
      }

      setDataStats(stats)
    } catch (error) {
      console.error("Error fetching data stats:", error)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "main"), {
        ...settings,
        updatedAt: new Date(),
      })

      toast({
        title: "Успешно",
        description: "Настройки сохранены",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
      })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteDialog = (collection: string, title: string, description: string) => {
    setDeleteDialog({
      isOpen: true,
      collection,
      title,
      description,
    })
  }

  const handleDeleteSuccess = () => {
    fetchDataStats()
    toast({
      title: "Успешно",
      description: "Данные удалены",
    })
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">Управление настройками сайта и системы</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Основные</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="database">База данных</TabsTrigger>
          <TabsTrigger value="danger">Опасная зона</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Настройки сайта и контактная информация</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Название сайта</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Телефон</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Часы работы</Label>
                  <Input
                    id="workingHours"
                    value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Описание сайта</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  rows={2}
                />
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Социальные сети</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={settings.socialLinks.instagram || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={settings.socialLinks.telegram || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, telegram: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Функции сайта</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Онлайн заказы</Label>
                      <p className="text-sm text-muted-foreground">Разрешить оформление заказов через сайт</p>
                    </div>
                    <Switch
                      checked={settings.features.enableOnlineOrders}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, enableOnlineOrders: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Отзывы</Label>
                      <p className="text-sm text-muted-foreground">Показывать отзывы на сайте</p>
                    </div>
                    <Switch
                      checked={settings.features.enableReviews}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, enableReviews: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Уведомления</Label>
                      <p className="text-sm text-muted-foreground">Отправлять уведомления о новых заказах</p>
                    </div>
                    <Switch
                      checked={settings.features.enableNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, enableNotifications: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO настройки</CardTitle>
              <CardDescription>Настройки для поисковой оптимизации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Ключевые слова</Label>
                <Textarea
                  id="keywords"
                  value={settings.seo.keywords}
                  onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords: e.target.value } })}
                  rows={2}
                  placeholder="ключевое слово, другое ключевое слово, еще одно"
                />
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">API ключи</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="yandexMaps">Яндекс.Карты API</Label>
                    <Input
                      id="yandexMaps"
                      value={settings.apiKeys.yandexMaps || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          apiKeys: { ...settings.apiKeys, yandexMaps: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                    <Input
                      id="googleAnalytics"
                      value={settings.apiKeys.googleAnalytics || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          apiKeys: { ...settings.apiKeys, googleAnalytics: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseConnectionCheck />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Статистика данных
              </CardTitle>
              <CardDescription>Информация о количестве записей в базе данных</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Товары</span>
                  </div>
                  <span className="text-lg font-bold">{dataStats.products}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Категории</span>
                  </div>
                  <span className="text-lg font-bold">{dataStats.categories}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Заказы</span>
                  </div>
                  <span className="text-lg font-bold">{dataStats.orders}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Images className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Галерея</span>
                  </div>
                  <span className="text-lg font-bold">{dataStats.gallery}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Пользователи</span>
                  </div>
                  <span className="text-lg font-bold">{dataStats.users}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Опасная зона
              </CardTitle>
              <CardDescription>Необратимые действия. Будьте осторожны при использовании этих функций.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Удаление данных по разделам</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() =>
                      openDeleteDialog(
                        "products",
                        "Удалить все товары",
                        "Это действие удалит все товары из каталога, включая их изображения.",
                      )
                    }
                  >
                    <Package2 className="mr-2 h-4 w-4" />
                    Удалить все товары ({dataStats.products})
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() =>
                      openDeleteDialog(
                        "categories",
                        "Удалить все категории",
                        "Это действие удалит все категории товаров.",
                      )
                    }
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Удалить все категории ({dataStats.categories})
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() =>
                      openDeleteDialog("orders", "Удалить все заказы", "Это действие удалит все заказы с сайта.")
                    }
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Удалить все заказы ({dataStats.orders})
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() =>
                      openDeleteDialog(
                        "gallery",
                        "Удалить всю галерею",
                        "Это действие удалит все изображения из галереи.",
                      )
                    }
                  >
                    <Images className="mr-2 h-4 w-4" />
                    Удалить всю галерею ({dataStats.gallery})
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3 text-destructive">Полная очистка</h4>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() =>
                    openDeleteDialog(
                      "all",
                      "УДАЛИТЬ ВСЕ ДАННЫЕ",
                      "Это действие удалит ВСЕ данные из базы: товары, категории, заказы, галерею и пользователей (кроме текущего). Восстановление будет невозможно!",
                    )
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  УДАЛИТЬ ВСЕ ДАННЫЕ
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Это действие удалит все данные безвозвратно
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Сохранить настройки
            </>
          )}
        </Button>
      </div>

      <BulkDeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}
        collectionName={deleteDialog.collection}
        title={deleteDialog.title}
        description={deleteDialog.description}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
