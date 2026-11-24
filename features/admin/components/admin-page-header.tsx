import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminPageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl transition-[width,height] ease-linear sm:px-4 md:h-16 md:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
      <h1 className="min-w-0 flex-1 truncate font-heading text-sm font-semibold tracking-tight">{title}</h1>
      <ThemeToggle className="shrink-0" />
    </header>
  );
}
