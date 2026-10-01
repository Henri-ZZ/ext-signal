"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  LayoutDashboard,
  Puzzle,
  Search,
  Settings,
  Swords,
  type LucideIcon,
} from "lucide-react"

import { AccountMenu } from "@/components/dashboard/account-menu"
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

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-[0.625rem] font-semibold tracking-tight text-primary-foreground">
                  ES
                </span>
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
            <SidebarMenuButton
              asChild
              isActive={isActiveRoute(pathname, "/dashboard/settings")}
              tooltip="Settings"
            >
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AccountMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
