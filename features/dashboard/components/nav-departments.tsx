"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { IconChevronDown, IconChevronUp, IconTag } from "@tabler/icons-react"

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
/** departments shown before "Show more" */
const VISIBLE_LIMIT = 8

type NavDepartmentsProps = {
  departments: Department[]
  /** the dashboard, where the filter applies from any other page */
  baseHref: string
  /** other pages that read the same `department` param and keep it in place */
  filterHrefs?: string[]
  /** every QR code, tagged or not */
  total: number
}

export function NavDepartments({ departments, baseHref, filterHrefs = [], total }: NavDepartmentsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // on a page that filters by department the links stay on it; elsewhere they go to the dashboard
  const filterHref = pathname === baseHref || filterHrefs.includes(pathname) ? pathname : null
  const selected = filterHref ? searchParams.get(PARAM) : null
  const [expanded, setExpanded] = React.useState(false)
  // never hide the department that is currently selected
  const selectedIndex = departments.findIndex((department) => department.name === selected)
  const collapsed = !expanded && departments.length > VISIBLE_LIMIT && selectedIndex < VISIBLE_LIMIT
  const visible = collapsed ? departments.slice(0, VISIBLE_LIMIT) : departments

  // keeps the page's other filters, but starts again from the first page
  const hrefFor = (name: string | null) => {
    const target = filterHref ?? baseHref
    const params = new URLSearchParams(filterHref ? searchParams.toString() : "")
    params.delete("page")
    if (name) params.set(PARAM, name)
    else params.delete(PARAM)
    const query = params.toString()
    return query ? `${target}?${query}` : target
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="uppercase tracking-wider">Filter by Department</SidebarGroupLabel>
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
        {visible.map((department) => (
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
        {departments.length > VISIBLE_LIMIT && (expanded || collapsed) && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? <IconChevronUp /> : <IconChevronDown />}
              <span>{expanded ? "Show less" : `Show ${departments.length - VISIBLE_LIMIT} more`}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
