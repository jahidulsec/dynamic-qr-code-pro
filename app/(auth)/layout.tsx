import React from "react";
import { IconCheck } from "@tabler/icons-react";

import { SiteLogo } from "@/components/shared/site-header";

const highlights = ["Edit destinations after printing", "Track every scan in real time", "Collaborate with your team"];

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <SiteLogo />
        </div>
        <main className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-violet/5 lg:flex lg:flex-col lg:justify-center lg:p-16">
        <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-mint/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-amber/20 blur-3xl" />

        <div className="relative max-w-md space-y-8">
          <h2 className="font-heading text-4xl font-semibold tracking-tight text-balance">
            QR codes that{" "}
            <span className="relative isolate whitespace-nowrap">
              <span aria-hidden className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-brand-amber/60" />
              change
            </span>{" "}
            when your plans do.
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <IconCheck className="size-4 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
