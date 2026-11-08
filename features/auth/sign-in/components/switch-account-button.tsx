"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/auth-client";

// signs the current user out and re-renders /sign-in with the form
export function SwitchAccountButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () =>
    startTransition(async () => {
      await signOut();
      router.refresh();
    });

  return (
    <Button type="button" variant="link" size="sm" disabled={isPending} onClick={onClick}>
      {isPending ? "Signing out…" : "Use a different account"}
    </Button>
  );
}
