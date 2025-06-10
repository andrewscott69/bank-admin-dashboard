"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Building2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigationItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Customer Management", icon: Users, href: "/dashboard/customers" },
  { title: "Transaction History", icon: CreditCard, href: "/dashboard/transactions" },
  { title: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [admin, setAdmin] = useState<null | { firstName: string; lastName: string; email: string }>(null)

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch("/api/admin/me")
        if (!res.ok) throw new Error("Session fetch failed")
        const data = await res.json()
        setAdmin(data.admin)
      } catch (err) {
        console.error("Failed to fetch admin session", err)
      }
    }

    fetchAdmin()
  }, [])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">SilverCrest Bank</h2>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full justify-start">
                    <Link href={item.href}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Admin avatar" />
            <AvatarFallback>
              {admin?.firstName?.[0] ?? "A"}
              {admin?.lastName?.[0] ?? "D"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {admin ? `${admin.firstName} ${admin.lastName}` : "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {admin?.email ?? "admin@bank.com"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
