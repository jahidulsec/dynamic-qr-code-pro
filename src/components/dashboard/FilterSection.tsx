"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Search, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";
import QrForm from "./QrForm";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { AuthUser } from "@/types/auth-user";
import { SearchForm } from "../shared/input/search";

export default function FilterSection({ user }: { user: AuthUser }) {
  const [addQr, setAddQr] = useState(false);
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search, 1000);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    if (search) {
      params.set("q", debounceValue);
      params.delete("p");
    } else {
      params.delete("q");
    }
    router.push(pathname + "?" + params.toString());
  }, [debounceValue]);

  return (
    <>
      <div className="flex justify-between items-center flex-col sm:flex-row gap-5 my-6">
        {/* filters */}
        <SearchForm />
        {/* buttons */}
        <div className="flex gap-3 items-center">
          <Button
            asChild
            variant={"secondary"}
            className="border border-muted-foreground hover:border-muted-foreground/50"
          >
            <Link href={"/admin/trash"}>
              <Trash />
              Trash
            </Link>
          </Button>
          <Button onClick={() => setAddQr(true)}>
            <PlusCircle />
            Generate QR
          </Button>
        </div>
      </div>

      {/* add doctor dialog */}
      <Sheet open={addQr} onOpenChange={setAddQr}>
        <SheetContent className="w-[75vw] p-0">
          <ScrollArea className="max-h-[85vh] px-6 my-6">
            <SheetHeader>
              <SheetTitle className="text-sm">Generate QR</SheetTitle>
            </SheetHeader>
            <QrForm
              qrLink={{ adminId: user.userId }}
              onClose={() => setAddQr(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
