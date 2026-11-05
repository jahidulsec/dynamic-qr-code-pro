"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { IconTag } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type Department = {
  name: string
  count: number
}

const PARAM = "department"

export function NavDepartments({ departments }: { departments: Department[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selected = searchParams.get(PARAM)
  const total = departments.reduce((sum, department) => sum + department.count, 0)

  const hrefFor = (name: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (name) params.set(PARAM, name)
    else params.delete(PARAM)
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="uppercase tracking-wider">Department Tags</SidebarGroupLabel>
      {selected && (
        <Link
          href={hrefFor(null)}
          className="absolute top-3.5 right-3 text-[11px] font-semibold text-sidebar-foreground underline underline-offset-2 hover:text-sidebar-accent-foreground"
        >
          Reset All
        </Link>
      )}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={!selected}
            className="data-active:font-semibold"
            render={<Link href={hrefFor(null)} />}
          >
            <IconTag />
            <span>All Departments</span>
          </SidebarMenuButton>
          <SidebarMenuBadge className="right-2 font-mono text-[11px] text-sidebar-foreground/60">
            {total}
          </SidebarMenuBadge>
        </SidebarMenuItem>
        {departments.map((department) => (
          <SidebarMenuItem key={department.name}>
            <SidebarMenuButton
              isActive={selected === department.name}
              render={<Link href={hrefFor(department.name)} />}
            >
              <span className="mx-1.5 size-1.5 shrink-0 rounded-full bg-sidebar-foreground/40" />
              <span className="font-mono">{department.name}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge className="right-2 font-mono text-[11px] text-sidebar-foreground/60">
              {department.count}
            </SidebarMenuBadge>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
