import { IconCircleCheckFilled, IconAlertTriangleFilled } from "@tabler/icons-react";
import { connection } from "next/server";

import prisma from "@/config/db";
import { cn } from "@/lib/utils";

type ServiceStatus = { name: string; description: string; operational: boolean; latencyMs?: number };

async function checkDatabase() {
  const startedAt = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { operational: true, latencyMs: Math.round(performance.now() - startedAt) };
  } catch {
    return { operational: false };
  }
}

/** Live health check. Runs per request, so render it inside <Suspense>. */
export async function SystemStatus() {
  await connection();
  const database = await checkDatabase();

  const services: ServiceStatus[] = [
    { name: "Web app & dashboard", description: "Sign-in, dashboard and QR management", operational: true },
    {
      name: "QR redirects",
      description: "Resolving scans to their destination",
      operational: database.operational,
      latencyMs: database.latencyMs,
    },
    { name: "Scan analytics", description: "Recording and reporting scans", operational: database.operational },
    { name: "Database", description: "Primary data store", ...database },
  ];
  const allOperational = services.every((service) => service.operational);
  const checkedAt = new Date().toUTCString();

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-5",
          allOperational
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        )}
      >
        {allOperational ? <IconCircleCheckFilled className="size-6" /> : <IconAlertTriangleFilled className="size-6" />}
        <p className="font-medium">{allOperational ? "All systems operational" : "Some systems are degraded"}</p>
      </div>

      <ul className="divide-y rounded-xl border">
        {services.map((service) => (
          <li key={service.name} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm">
              {service.latencyMs !== undefined && (
                <span className="text-muted-foreground tabular-nums">{service.latencyMs} ms</span>
              )}
              <span
                className={cn(
                  "size-2 rounded-full",
                  service.operational ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              <span className="font-medium">{service.operational ? "Operational" : "Degraded"}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">Checked {checkedAt}. Reload the page to check again.</p>
    </div>
  );
}

export function SystemStatusSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
