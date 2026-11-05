"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import type { ScanReportPoint } from "@/features/reports/libs/reports-analytics";

type ScanTrendChartProps = {
  data: ScanReportPoint[];
};

const tick = { fill: "var(--muted-foreground)", fontSize: 12 };

export function ScanTrendChart({ data }: ScanTrendChartProps) {
  const gradientId = useId();
  // dots only while they stay readable; 24 hourly / 30 daily points get them on hover instead
  const showDots = data.length <= 12;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.22 }} />
              <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={tick}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={tick}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
            tickFormatter={(value: number) => value.toLocaleString()}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }}
            content={(props) => <TrendTooltip {...props} />}
          />
          <Area
            type="monotone"
            dataKey="scans"
            name="Scans"
            stroke="var(--primary)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={showDots ? { r: 4, strokeWidth: 2, fill: "var(--card)", stroke: "var(--primary)" } : false}
            activeDot={{ r: 5, strokeWidth: 2, fill: "var(--card)", stroke: "var(--primary)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  const point = payload?.[0]?.payload as ScanReportPoint | undefined;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <p className="text-muted-foreground">{point.fullLabel}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
        {point.scans.toLocaleString()} {point.scans === 1 ? "scan" : "scans"}
      </p>
    </div>
  );
}
