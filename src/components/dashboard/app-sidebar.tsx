"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  LayoutDashboard,
  Puzzle,
  Search,
  Swords,
  type LucideIcon,
} from "lucide-react"

import { AccountMenu } from "@/components/dashboard/account-menu"
import type { SessionUser } from "@/lib/session"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavigationItem = {
  title: string
  href: string
  icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Extensions", href: "/dashboard/extensions", icon: Puzzle },
  { title: "Keywords", href: "/dashboard/keywords", icon: Search },
  { title: "Competitors", href: "/dashboard/competitors", icon: Swords },
  { title: "Discover", href: "/dashboard/discover", icon: Compass },
]

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src="/logo.png"
                  alt=""
                  width={28}
                  height={28}
                  priority
                  className="size-7 shrink-0"
                />
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-heading truncate text-sm font-semibold">
                    ExtSignal
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Search intelligence
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tracking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
