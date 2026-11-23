"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconBuilding,
  IconCreditCard,
  IconHistory,
  IconLayoutDashboard,
  IconLogout,
  IconUsers,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { ADMIN_LOGIN_PATH, ADMIN_PAGE_TITLES, ADMIN_PATHS, APP_HOME_PATH } from "@/features/admin/constants";
import { signOut } from "@/lib/auth/auth-client";

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image?: string | null };
  pendingCount: number;
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AdminSidebar({ user, pendingCount, ...props }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isSigningOut, startSignOut] = React.useTransition();

  const items = [
    { title: ADMIN_PAGE_TITLES.dashboard, url: ADMIN_PATHS.dashboard, icon: <IconLayoutDashboard />, exact: true },
    { title: ADMIN_PAGE_TITLES.organizations, url: ADMIN_PATHS.organizations, icon: <IconBuilding />, badge: pendingCount },
    { title: ADMIN_PAGE_TITLES.plans, url: ADMIN_PATHS.plans, icon: <IconCreditCard /> },
    { title: ADMIN_PAGE_TITLES.users, url: ADMIN_PATHS.users, icon: <IconUsers /> },
    { title: ADMIN_PAGE_TITLES.auditLog, url: ADMIN_PATHS.auditLog, icon: <IconHistory /> },
  ];

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  // on mobile the sidebar is a sheet over the page: close it once something in it is picked
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const onSignOut = () =>
    startSignOut(async () => {
      await signOut();
      router.push(ADMIN_LOGIN_PATH);
      router.refresh();
    });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Admin"
              render={<Link href={ADMIN_PATHS.dashboard} onClick={closeMobile} />}
            >
              {/* Served from app/icon.svg, the same file used for the favicon */}
              <Image src="/icon.svg" alt="" width={32} height={32} unoptimized className="size-8 shrink-0" />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading text-sm font-semibold">Dynamic QR Pro</span>
                <span className="truncate text-xs text-muted-foreground">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={isActive(item.url, item.exact)}
                  tooltip={item.title}
                  render={<Link href={item.url} onClick={closeMobile} />}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {!!item.badge && (
                  <SidebarMenuBadge
                    aria-label={`${item.badge} pending`}
                    className="bg-primary text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-active/menu-button:text-primary-foreground"
                  >
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
              <Avatar className="size-8">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Back to app" render={<Link href={APP_HOME_PATH} onClick={closeMobile} />}>
              <IconArrowLeft />
              <span>Back to app</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              disabled={isSigningOut}
              onClick={onSignOut}
              className="text-destructive hover:text-destructive"
            >
              <IconLogout />
              <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
