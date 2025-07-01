import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseProvider } from "@/lib/firebase/firebase-provider"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseConnectionStatus } from "@/components/firebase-connection-status"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "MAESTRO Admin",
  description: "Административная консоль для управления контентом MAESTRO",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} disableTransitionOnChange>
          <FirebaseProvider>
            {children}
            <Toaster />
            <FirebaseConnectionStatus />
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
