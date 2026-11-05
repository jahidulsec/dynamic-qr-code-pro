"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done";

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
  const [status, setStatus] = useState<Status>("idle");
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Route changed: finish the bar (fill to the right edge, then fade).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (status === "loading") setStatus("done");
  }

  useEffect(() => {
    // Capture phase: next/link calls preventDefault() in its React onClick,
    // which runs before a bubbling document listener would.
    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest("a");
      if (link && isInternalNavigation(link)) setStatus("loading");
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  // After the fill + fade finishes, reset to 0 width without animating back.
  useEffect(() => {
    if (status !== "done") return;
    const timeout = setTimeout(() => setStatus("idle"), 500);
    return () => clearTimeout(timeout);
  }, [status]);

  return (
    <div
      role="progressbar"
      aria-hidden={status !== "loading"}
      aria-label="Page loading"
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-50 h-0.5 bg-primary",
        status === "idle" && "w-0 opacity-0",
        status === "loading" &&
          "w-4/5 opacity-100 transition-[width] duration-[10s] ease-out",
        status === "done" &&
          "w-full opacity-0 [transition:width_200ms_ease-out,opacity_300ms_ease_200ms]",
      )}
    />
  );
}
