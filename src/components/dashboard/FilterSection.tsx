"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Trash } from "lucide-react";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import QrForm from "./QrForm";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { AuthUser } from "@/types/auth-user";
import { SearchForm } from "../shared/input/search";
import Combobox from "../shared/combobx/combobox";
import { getTags } from "@/servers/lib/tag";
import { tags } from "@prisma/client";

export default function FilterSection({ user }: { user: AuthUser }) {
  const [addQr, setAddQr] = useState(false);
  const searchParams = useSearchParams();
  const value = searchParams.get("tag") ?? undefined;

  return (
    <>
      <div className="flex justify-between items-center flex-col sm:flex-row gap-5 my-6">
        {/* filters */}
        <div className="flex items-center flex-col sm:flex-row gap-3">
          <SearchForm />
          <Combobox
            className="w-full sm:w-fit min-w-[9rem]"
            defaultValue={value}
            paramName={"tag"}
            placeholder="Select Tag"
            fetcher={(params) => getTags({ ...params })}
            getKey={(item: tags) => item.slug ?? ""}
            getLabel={(item: tags) => item.name}
          />
        </div>
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
