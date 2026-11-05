import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Suspense } from "react";

import prisma from "@/config/db";
import { brandConfig } from "@/config/brand";
import { recordScan } from "@/features/qr/services/record-scan";
import { qrSlugSchema } from "@/features/qr/schemas/qr-schema";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function QrRedirectPage({ params }: PageProps<"/q/[slug]">) {
  return (
    <Suspense>
      <QrRedirect params={params} />
    </Suspense>
  );
}

async function QrRedirect({ params }: Pick<PageProps<"/q/[slug]">, "params">) {
  const { slug } = await params;

  const parsed = qrSlugSchema.safeParse(slug.toLowerCase());
  const qr = parsed.success
    ? await prisma.qrCode.findUnique({
        where: { slug: parsed.data },
        select: { id: true, destination: true, status: true, expiresAt: true, deletedAt: true },
      })
    : null;

  if (!qr || qr.deletedAt) return <InactiveQr title="This QR code doesn't exist" />;
  if (qr.status === "PAUSED") return <InactiveQr title="This QR code is paused" />;
  if (qr.expiresAt && qr.expiresAt <= new Date()) return <InactiveQr title="This QR code has expired" />;

  const requestHeaders = new Headers(await headers());
  // log after the response is sent so the scan never waits on the database write
  after(() => recordScan(qr.id, requestHeaders).catch((error) => console.error("Failed to record QR scan", error)));

  redirect(qr.destination);
}

function InactiveQr({ title }: { title: string }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-sm place-items-center px-4 py-8 text-center">
      <div>
        <title>{title}</title>
        <h1 className="mb-2 font-heading text-xl font-semibold">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">
          The owner may have turned it off or removed it. Please contact them for an updated link.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">{brandConfig.name}</p>
      </div>
    </main>
  );
}
