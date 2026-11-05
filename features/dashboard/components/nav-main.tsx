"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type BadgeTone = "default" | "success" | "info" | "outline"

export type NavMainItem = {
  title: string
  url: string
  icon: React.ReactNode
  /** Match only the exact URL (used for the dashboard root). */
  exact?: boolean
  badge?: { label: string; tone?: BadgeTone }
}

const badgeTones: Record<BadgeTone, string> = {
  default: "bg-background font-mono text-sidebar-foreground border",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  info: "bg-blue-50 font-mono text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  outline: "bg-sidebar-accent font-mono text-sidebar-foreground/80",
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase tracking-wider">Menu Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(`${item.url}/`)

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.title}
                render={<Link href={item.url} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge
                  className={cn("right-2 px-1.5 text-[11px]", badgeTones[item.badge.tone ?? "default"])}
                >
                  {item.badge.label}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
