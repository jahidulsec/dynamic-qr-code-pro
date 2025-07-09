"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function FilterSection() {
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
        <div className="filters flex-1 w-full">
          {/* search */}
          <div className="search relative">
            <Input
              title="Search"
              className="pl-10 sm:max-w-[18rem]"
              id="search"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Label
              htmlFor="search"
              className="absolute top-[50%] -translate-y-[50%] left-3"
            >
              <Search className="size-4" />
            </Label>
          </div>
        </div>
        {/* buttons */}
        <div className="flex gap-3 items-center">
          <Button asChild variant={"secondary"} className="border border-muted-foreground hover:border-muted-foreground/50">
            <Link href={"/admin/trash"}>
              <Trash />
              Trash
            </Link>
          </Button>
          <Button onClick={() => setAddQr(true)}>
            <PlusCircle />
            Generate QR</Button>
        </div>
      </div>

      {/* add doctor dialog */}
      <Dialog open={addQr} onOpenChange={setAddQr}>
        <DialogContent className="w-[75vw] p-0">
          <ScrollArea className="max-h-[85vh] px-6 my-6">
            <DialogHeader>
              <DialogTitle className="text-sm">Generate QR</DialogTitle>
            </DialogHeader>
            <QrForm onClose={() => setAddQr(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
