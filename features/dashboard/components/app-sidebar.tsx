"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconCreditCard,
  IconFileInvoice,
  IconLayoutDashboard,
  IconPlus,
  IconScan,
  IconStack2,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react"

import { NavDepartments, type Department } from "@/features/dashboard/components/nav-departments"
import { NavMain, type NavMainItem } from "@/features/dashboard/components/nav-main"
import { NavUser } from "@/features/dashboard/components/nav-user"
import { TeamSwitcher } from "@/features/dashboard/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// TODO: replace placeholder counts and departments with real data once QR codes are modelled
function getNavItems(slug: string): NavMainItem[] {
  const base = `/${slug}`
  return [
    { title: "Dashboard", url: base, exact: true, icon: <IconLayoutDashboard />, badge: { label: "20" } },
    { title: "Graph Reports", url: `${base}/reports`, icon: <IconChartBar />, badge: { label: "Live", tone: "success" } },
    { title: "Click to Check", url: `${base}/check`, icon: <IconScan /> },
    { title: "Batch Generator", url: `${base}/batch`, icon: <IconStack2 /> },
    { title: "Yearly Subscription", url: `${base}/subscription`, icon: <IconCreditCard />, badge: { label: "250 QRs", tone: "outline" } },
    { title: "Billing History", url: `${base}/billing`, icon: <IconFileInvoice />, badge: { label: "PDF", tone: "info" } },
    { title: "Team & Permissions", url: `${base}/team`, icon: <IconUsers />, badge: { label: "5 Seats", tone: "outline" } },
    { title: "Trash Bin", url: `${base}/trash`, icon: <IconTrash /> },
  ]
}

const departments: Department[] = [
  { name: "RNL", count: 3 },
  { name: "JBL", count: 1 },
  { name: "RPL", count: 14 },
  { name: "HR", count: 1 },
  { name: "IBRPL", count: 1 },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: React.ComponentProps<typeof NavUser>["user"]
  organizations: React.ComponentProps<typeof TeamSwitcher>["organizations"]
  activeSlug: string
}

export function AppSidebar({ user, organizations, activeSlug, ...props }: AppSidebarProps) {
  const navItems = React.useMemo(() => getNavItems(activeSlug), [activeSlug])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-3">
        <TeamSwitcher organizations={organizations} activeSlug={activeSlug} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Generate Dynamic QR"
              className="justify-center bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              render={<Link href={`/${activeSlug}/qr/new`} />}
            >
              <IconPlus />
              <span>Generate Dynamic QR</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <NavMain items={navItems} />
        <SidebarSeparator className="mx-0 group-data-[collapsible=icon]:hidden" />
        <NavDepartments departments={departments} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
