"use client";

import * as React from "react";
import {
  IconChartBar,
  IconCreditCard,
  IconFileInvoice,
  IconLayoutDashboard,
  IconPlus,
  IconScan,
  IconStack2,
  IconTags,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

import {
  NavDepartments,
  type Department,
} from "@/features/dashboard/components/nav-departments";
import {
  NavMain,
  type NavMainItem,
} from "@/features/dashboard/components/nav-main";
import { NavUser } from "@/features/dashboard/components/nav-user";
import { TeamSwitcher } from "@/features/dashboard/components/team-switcher";
import { QrFormDialog } from "@/features/qr";
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
} from "@/components/ui/sidebar";

// TODO: replace the remaining placeholder badges once subscriptions and teams are built
function getNavItems(slug: string, qrCount: number): NavMainItem[] {
  const base = `/${slug}`;
  return [
    {
      title: "Dashboard",
      url: base,
      exact: true,
      icon: <IconLayoutDashboard />,
      badge: { label: String(qrCount) },
    },
    {
      title: "Graph Reports",
      url: `${base}/reports`,
      icon: <IconChartBar />,
      badge: { label: "Live", tone: "success" },
    },
    { title: "Click to Check", url: `${base}/check`, icon: <IconScan /> },
    { title: "Batch Generator", url: `${base}/batch`, icon: <IconStack2 /> },
    {
      title: "Yearly Subscription",
      url: `${base}/subscription`,
      icon: <IconCreditCard />,
      badge: { label: "250 QRs", tone: "outline" },
    },
    {
      title: "Billing History",
      url: `${base}/billing`,
      icon: <IconFileInvoice />,
      badge: { label: "PDF", tone: "info" },
    },
    {
      title: "Team & Permissions",
      url: `${base}/team`,
      icon: <IconUsers />,
      badge: { label: "5 Seats", tone: "outline" },
    },
    { title: "Department Tags", url: `${base}/tags`, icon: <IconTags /> },
    { title: "Trash Bin", url: `${base}/trash`, icon: <IconTrash /> },
  ];
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: React.ComponentProps<typeof NavUser>["user"];
  organizations: React.ComponentProps<typeof TeamSwitcher>["organizations"];
  activeSlug: string;
  /** short-link base, resolved on the server */
  baseUrl: string;
  qrCount: number;
  departments: Department[];
};

export function AppSidebar({
  user,
  organizations,
  activeSlug,
  baseUrl,
  qrCount,
  departments,
  ...props
}: AppSidebarProps) {
  const navItems = React.useMemo(
    () => getNavItems(activeSlug, qrCount),
    [activeSlug, qrCount],
  );
  const tags = React.useMemo(
    () => departments.map((department) => department.name),
    [departments],
  );

  const [createOpen, setCreateOpen] = React.useState(false);

  const openCreate = () => {
    setCreateOpen(true);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-3">
        <TeamSwitcher organizations={organizations} activeSlug={activeSlug} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Generate Dynamic QR"
              className="justify-center bg-foreground font-medium text-background hover:bg-foreground/70 hover:text-background active:bg-foreground/70 active:text-background dark:bg-foreground/70"
              onClick={openCreate}
            >
              <IconPlus className="text-secondary" />
              <span>Generate Dynamic QR</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <NavMain items={navItems} />
        <SidebarSeparator className="mx-0 group-data-[collapsible=icon]:hidden" />
        <NavDepartments
          departments={departments}
          baseHref={`/${activeSlug}`}
          filterHrefs={[`/${activeSlug}/reports`]}
          total={qrCount}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />

      <QrFormDialog
        organizationSlug={activeSlug}
        baseUrl={baseUrl}
        tags={tags}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </Sidebar>
  );
}
