"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type NavMainItem = {
  title: string
  url: string
  icon: React.ReactNode
  /** Match only the exact URL (used for the dashboard root). */
  exact?: boolean
}

export type NavMainGroup = {
  label: string
  items: NavMainItem[]
}

export function NavMain({ groups }: { groups: NavMainGroup[] }) {
  const pathname = usePathname()

  const isActive = (item: NavMainItem) =>
    item.exact
      ? pathname === item.url
      : pathname === item.url || pathname.startsWith(`${item.url}/`)

  return groups.map((group) => (
    <SidebarGroup key={group.label}>
      <SidebarGroupLabel className="uppercase tracking-wider">{group.label}</SidebarGroupLabel>
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActive(item)}
              tooltip={item.title}
              render={<Link href={item.url} />}
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  ))
}
