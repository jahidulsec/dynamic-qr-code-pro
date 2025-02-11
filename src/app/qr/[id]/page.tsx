import { redirect } from "next/navigation";
import React from "react";
import db from "../../../../db/db";

export default async function QrPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const qrLink = await db.qrLinks.findUnique({
    where: { id },
  });

  await db.qrLinks.update({
    where: { id },
    data: {
      visitedCount: Number(qrLink?.visitedCount) + 1,
    },
  });
  
  if (!qrLink) return <div>No data</div>;
  redirect(qrLink?.link);
}
