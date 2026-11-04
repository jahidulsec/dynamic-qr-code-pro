"use client"

import * as React from "react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { IconSelector, IconPlus } from "@tabler/icons-react"

type Organization = {
  name: string
  slug: string
  logo?: string | null
}

function OrganizationLogo({ organization }: { organization: Organization }) {
  return (
    <Avatar className="size-full rounded-[inherit] after:rounded-[inherit]">
      <AvatarImage src={organization.logo ?? undefined} alt="" className="rounded-[inherit]" />
      <AvatarFallback className="rounded-[inherit] bg-transparent text-xs font-semibold text-inherit">
        {organization.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export function TeamSwitcher({
  organizations,
  activeSlug,
}: {
  organizations: Organization[]
  activeSlug: string
}) {
  const { isMobile } = useSidebar()
  const activeOrganization = organizations.find((organization) => organization.slug === activeSlug)
  if (!activeOrganization) {
    return null
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <OrganizationLogo organization={activeOrganization} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeOrganization.name}</span>
              <span className="truncate text-xs">/{activeOrganization.slug}</span>
            </div>
            <IconSelector className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((organization, index) => (
                <DropdownMenuItem
                  key={organization.slug}
                  render={<Link href={`/${organization.slug}`} />}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <OrganizationLogo organization={organization} />
                  </div>
                  {organization.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <IconPlus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
