import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireCurrentUser } from "@/lib/session"

/**
 * Every dashboard route reads live data from Neon, so the whole segment is
 * rendered per request. `force-dynamic` also keeps `next build` from touching
 * the database.
 */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await requireCurrentUser()

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
