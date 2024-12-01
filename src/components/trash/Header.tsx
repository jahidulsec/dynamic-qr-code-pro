"use client";

import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next-nprogress-bar";

export default function TrashHeader() {
  const router = useRouter();

  return (
    <section className="flex items-center gap-5">
      <Button
        variant={"outline"}
        size={"icon"}
        className="rounded-full"
        onClick={() => {
          router.back();
        }}
      >
        <ChevronLeft />
      </Button>

      {/* title */}
      <h2 className="font-semibold text-2xl">Trash</h2>
    </section>
  );
}
