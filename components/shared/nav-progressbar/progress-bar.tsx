"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

function isModifiedClick(event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function isInternalNavigation(link: HTMLAnchorElement) {
  return (
    (!link.target || link.target === "_self") &&
    !link.hasAttribute("download") &&
    link.origin === window.location.origin &&
    link.pathname !== window.location.pathname
  );
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Reset during render when the route changes instead of in an effect.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setLoading(false);
  }

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest("a");
      if (link && isInternalNavigation(link)) setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      role="progressbar"
      aria-hidden={!loading}
      aria-label="Page loading"
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-50 h-0.5 bg-primary",
        loading
          ? "w-4/5 opacity-100 transition-[width] duration-[10s] ease-out"
          : "w-0 opacity-0 transition-opacity duration-300",
      )}
    />
  );
}
