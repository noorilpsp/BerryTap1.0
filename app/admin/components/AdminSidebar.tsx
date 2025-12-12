'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { usePermissions } from '@/lib/hooks/usePermissions'

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Merchants', href: '/admin/merchants', icon: BarChart3 },
  { title: 'Personnel', href: '/admin/personnel', icon: Users },
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
]

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { permissions, loading } = usePermissions()

  return (
    <SidebarProvider>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader className="gap-3 px-3 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold leading-none">BerryTap Admin</span>
              <span className="text-muted-foreground text-xs">Internal tools</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/admin')

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter className="px-3">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Access</span>
              <span className="text-muted-foreground text-xs">
                {loading
                  ? 'Loading...'
                  : permissions?.platformAdmin
                    ? 'Super admin'
                    : permissions?.totalMerchants
                      ? `${permissions.totalMerchants} merchant${permissions.totalMerchants > 1 ? 's' : ''}`
                      : 'No access'}
              </span>
            </div>
            <Badge
              variant={permissions?.platformAdmin ? 'default' : 'outline'}
              className="text-xs"
            >
              {loading ? '...' : permissions?.platformAdmin ? 'Admin' : 'User'}
            </Badge>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="bg-background/90 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">BerryTap</span>
            <span className="text-lg font-semibold leading-none">Admin Console</span>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
