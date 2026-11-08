"use client";

import * as React from "react";
import {
  IconChartBar,
  IconLayoutDashboard,
  IconPlus,
  IconScan,
  IconSettings,
  IconTags,
  IconTrash,
} from "@tabler/icons-react";

import {
  NavDepartments,
  type Department,
} from "@/features/dashboard/components/nav-departments";
import {
  NavMain,
  type NavMainGroup,
} from "@/features/dashboard/components/nav-main";
import { NavUser } from "@/features/dashboard/components/nav-user";
import { TeamSwitcher } from "@/features/dashboard/components/team-switcher";
import { PAGE_TITLES } from "@/features/dashboard/constants";
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

function getNavGroups(slug: string): NavMainGroup[] {
  const base = `/${slug}`;
  return [
    {
      label: "QR Codes",
      items: [
        {
          title: PAGE_TITLES.dashboard,
          url: base,
          exact: true,
          icon: <IconLayoutDashboard />,
        },
        { title: PAGE_TITLES.check, url: `${base}/check`, icon: <IconScan /> },
        { title: PAGE_TITLES.tags, url: `${base}/tags`, icon: <IconTags /> },
        { title: PAGE_TITLES.trash, url: `${base}/trash`, icon: <IconTrash /> },
      ],
    },
    {
      label: "Insights",
      items: [
        {
          title: PAGE_TITLES.reports,
          url: `${base}/reports`,
          icon: <IconChartBar />,
        },
      ],
    },
    {
      label: "Workspace",
      items: [
        { title: PAGE_TITLES.settings, url: `${base}/settings`, icon: <IconSettings /> },
      ],
    },
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
  const navGroups = React.useMemo(
    () => getNavGroups(activeSlug),
    [activeSlug],
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
        <NavMain groups={navGroups} />
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
