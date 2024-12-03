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
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";
import AdminForm from "./AdminForm";

export default function FilterSection() {
  const [add, setAdd] = useState(false);
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search, 1000);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("q", debounceValue);
      params.delete("p");
    } else {
      params.delete("q");
    }
    router.push(pathname + "?" + params.toString());
  }, [debounceValue, searchParams, pathname, router, search]);

  return (
    <>
      <div className="flex justify-between items-center gap-5 my-6">
        {/* filters */}
        <div className="filters">
          {/* search */}
          <div className="search relative">
            <Input
              title="Search"
              className="pl-10 max-w-[18rem]"
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
          <Button onClick={() => setAdd(true)}>Add user</Button>
        </div>
      </div>

      {/* add doctor dialog */}
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent className="w-[75vw] p-0">
          <ScrollArea className="max-h-[85vh] px-6 my-6">
            <DialogHeader>
              <DialogTitle className="text-sm">Add User</DialogTitle>
            </DialogHeader>
            <AdminForm onClose={() => setAdd(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
