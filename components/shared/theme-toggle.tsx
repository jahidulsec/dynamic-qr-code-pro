"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Flips between light and dark. Icons swap via the `dark` class, so there's no hydration flash. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("rounded-full", className)}
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <IconSun className="size-4 dark:hidden" />
      <IconMoon className="hidden size-4 dark:block" />
    </Button>
  );
}
