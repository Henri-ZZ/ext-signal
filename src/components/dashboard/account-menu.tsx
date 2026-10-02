"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Loader2, LogOut, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth/client"
import type { SessionUser } from "@/lib/session"

export function AccountMenu({ user }: { user: SessionUser }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)

    try {
      await authClient.signOut()
    } finally {
      // Navigate away regardless: the session cookie is the source of truth,
      // and a reload is the surest way to drop any cached dashboard payload.
      router.replace("/auth/sign-in")
      router.refresh()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" tooltip={user.name}>
          <Avatar size="sm">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <span className="grid flex-1 text-left leading-tight">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </span>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{user.name}</span>
          <span className="text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings />
            Workspace settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={() => void signOut()}
        >
          {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
