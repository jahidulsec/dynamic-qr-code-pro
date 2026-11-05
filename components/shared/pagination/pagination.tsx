"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

const DEFAULT_PAGE_SIZE = 20;

export default function PagePagination({
  count,
  limit,
}: {
  limit?: number;
  count: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const size = Number(searchParams.get("size")) || limit || DEFAULT_PAGE_SIZE;

  const [pageSize, setPageSize] = React.useState(size);

  const page = searchParams.get("page") ?? "1";
  let pageNumber = Math.ceil(count / size);
  pageNumber = pageNumber === 0 ? 1 : pageNumber;

  const handlePageParams = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="@container/pagination flex items-center justify-between">
      <div className="text-muted-foreground hidden flex-1 text-sm @2xl/pagination:flex">
        Overall {count} row(s) counted.
      </div>
      <div className="flex w-full items-center gap-8 @2xl/pagination:w-fit">
        <div className="hidden items-center gap-2 @2xl/pagination:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            {size} Rows per page
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));

              const params = new URLSearchParams(searchParams);
              params.set("size", value ?? "20");
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {page} of {pageNumber}
        </div>
        <div className="ml-auto flex items-center gap-2 @2xl/pagination:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 @2xl/pagination:flex"
            onClick={() => {
              handlePageParams(1);
            }}
            disabled={Number(page) === 1}
          >
            <span className="sr-only">Go to first page</span>
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => {
              handlePageParams(Number(page) - 1);
            }}
            disabled={Number(page) === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => {
              handlePageParams(Number(page) + 1);
            }}
            disabled={Number(page) === pageNumber}
          >
            <span className="sr-only">Go to next page</span>
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 @2xl/pagination:flex"
            size="icon"
            onClick={() => {
              handlePageParams(pageNumber);
            }}
            disabled={Number(page) === pageNumber}
          >
            <span className="sr-only">Go to last page</span>
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
