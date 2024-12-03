"use client";

import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next-nprogress-bar";
import { ChevronLeft } from "lucide-react";

export default function Header() {
  const router = useRouter();

  return (
    <section className="flex items-center gap-5 mb-6">
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
      <h2 className="font-semibold text-2xl">Settings</h2>
    </section>
  );
}
