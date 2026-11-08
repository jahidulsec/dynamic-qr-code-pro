"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconDevices, IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelBody, PanelFooter } from "@/features/profile/components/profile-panel";
import { RevokeOtherSessionsButton, RevokeSessionButton } from "@/features/profile/components/session-actions";
import { describeDevice, formatIpAddress, type DeviceKind } from "@/features/profile/libs/device";
import { getUserSessions } from "@/features/profile/libs/sessions";
import { cn } from "@/lib/utils";

type SessionsResult = Awaited<ReturnType<typeof getUserSessions>>;

const DEVICE_ICONS: Record<DeviceKind, React.ReactNode> = {
  desktop: <IconDeviceDesktop />,
  mobile: <IconDeviceMobile />,
  tablet: <IconDeviceTablet />,
};

// rendered only once the dialog is open, so dates use the viewer's own locale and time zone
const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

export function SessionPanel() {
  const [result, setResult] = useState<SessionsResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => startTransition(async () => setResult(await getUserSessions())), []);

  useEffect(load, [load]);

  const items = result?.data ?? [];
  const others = items.filter((session) => !session.current).length;

  return (
    <>
      <PanelBody>
        {!result ? (
          <SessionSkeleton />
        ) : !items.length ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            <IconDevices className="size-8" />
            {result.success ? "No active sessions." : result.message}
          </div>
        ) : (
          <ul className={cn("flex flex-col gap-2 transition-opacity", isPending && "opacity-60")}>
            {items.map((session) => {
              const device = describeDevice(session.userAgent);
              return (
                <li
                  key={session.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40",
                    session.current && "border-primary/30 bg-primary/5 hover:bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5",
                      session.current && "bg-primary/10 text-primary",
                    )}
                  >
                    {DEVICE_ICONS[device.kind]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="truncate text-sm font-medium">{device.label}</span>
                      {session.current && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                          <span className="size-1.5 animate-pulse rounded-full bg-current" />
                          This device
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{formatIpAddress(session.ipAddress)}</span>
                      {" · "}Signed in {dateFormatter.format(new Date(session.createdAt))}
                      <span className="hidden sm:inline">
                        {" · "}Expires {dateFormatter.format(new Date(session.expiresAt))}
                      </span>
                    </p>
                  </div>
                  {!session.current && <RevokeSessionButton sessionId={session.id} onDone={load} />}
                </li>
              );
            })}
          </ul>
        )}
      </PanelBody>

      <PanelFooter>
        <div className="flex items-center gap-1">
          <span>
            {result ? `${items.length} active ${items.length === 1 ? "session" : "sessions"}` : "Loading sessions…"}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={load} disabled={isPending} aria-label="Reload sessions">
            <IconRefresh className={cn(isPending && "animate-spin")} />
          </Button>
        </div>
        {others > 0 && <RevokeOtherSessionsButton onDone={load} />}
      </PanelFooter>
    </>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl border p-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
