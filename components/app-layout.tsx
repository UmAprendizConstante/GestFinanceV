"use client"

import type React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { BarChart3, Database, FileText, Package, Settings, Home, Eye, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Transações", url: "/transacoes", icon: Database },
  { title: "Cadastros", url: "/cadastros", icon: Settings },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Vitrine", url: "/vitrine", icon: Eye },
  { title: "Saída Produtos", url: "/saida-produtos", icon: ShoppingCart },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-2 md:p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              <span className="font-bold text-sm md:text-lg">Gestão Financeira</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="text-sm md:text-base">
                      <item.icon className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-12 md:h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-base md:text-lg font-semibold">
                {menuItems.find((item) => item.url === pathname)?.title || "Dashboard"}
              </h1>
            </div>
          </header>
          <main className="flex-1 p-2 md:p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
