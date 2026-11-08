import Image from "next/image";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/features/dashboard/components/nav-user";
import { getOrganizationBySlug, getSession } from "@/features/organizations/server";

export async function PageHeader({ organizationSlug, title }: { organizationSlug: string; title: string }) {
  // the layout already guards access and the session; these reuse its cached lookups
  const [organization, session] = await Promise.all([getOrganizationBySlug(organizationSlug), getSession()]);
  const dashboardHref = `/${organizationSlug}`;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl transition-[width,height] ease-linear sm:px-4 md:h-16 md:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />

        <Link
          href={dashboardHref}
          aria-label="Dynamic QR Pro, go to dashboard"
          className="flex shrink-0 items-center gap-2 rounded-md font-heading text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Served from app/icon.svg, the same file used for the favicon */}
          <Image src="/icon.svg" alt="" width={24} height={24} unoptimized className="size-6" />
          <span className="hidden lg:inline">Dynamic QR Pro</span>
        </Link>

        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbSeparator />
            {organization && (
              <>
                <BreadcrumbItem className="hidden min-w-0 md:inline-flex">
                  <BreadcrumbLink render={<Link href={dashboardHref} />} className="max-w-48 truncate">
                    {organization.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {session && (
        <div className="shrink-0">
          <NavUser
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              emailVerified: session.user.emailVerified,
              createdAt: session.user.createdAt,
            }}
          />
        </div>
      )}
    </header>
  );
}
