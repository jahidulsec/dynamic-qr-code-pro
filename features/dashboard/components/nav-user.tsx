"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth/auth-client"
import { ProfileDialog, type ProfileUser } from "@/features/profile"
import { IconSelector, IconLogout, IconUser } from "@tabler/icons-react"

export function NavUser({ user }: { user: ProfileUser }) {
  const { isMobile } = useSidebar()
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const onSignOut = async () => {
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <IconSelector className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <IconUser />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSignOut}>
              <IconLogout
              />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ProfileDialog user={user} open={profileOpen} onOpenChange={setProfileOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
