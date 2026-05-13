"use client";

import React from "react";

import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";

type FetchParams = {
  page: number;
  size: number;
  search?: string;
};

type FetchResult<T> = {
  success: boolean;
  data?: T[] | null;
};

interface AsyncComboboxProps<T> {
  fetcher: (params: FetchParams) => Promise<FetchResult<T>>;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  getLabel: (item: T) => string;
  getKey: (item: T) => React.Key;
  disabledKeys?: string[];
  className?: string;
  paramName?: string;
}

export default function Combobox<T>({
  fetcher,
  onValueChange,
  getKey,
  getLabel,
  className,
  placeholder = "Select an option",
  defaultValue,
  disabledKeys,
  paramName,
}: AsyncComboboxProps<T>) {
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(
    defaultValue ??
      (paramName && searchParams.get(paramName)?.toString()) ??
      "",
  );
  const [select, setSelect] = React.useState<T>();
  const [data, setData] = React.useState<T[]>([]);
  const [input, setInput] = React.useState(defaultValue ?? "");
  const search = useDebounce(input);

  const pathname = usePathname();
  const router = useRouter();

  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await fetcher({
        page: 1,
        size: 100,
        search,
      });

      if (res.success) {
        setData(res.data ?? []);

        if (defaultValue && res.data) {
          const found = res.data.find(
            (item) => getKey(item).toString() === defaultValue,
          );
          if (found) setSelect(found);
        }
      }
    });
  }, [search, fetcher]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-0.5">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn("overflow-hidden justify-between", className)}
            // disabled={pending}
          >
            <span className="text-left overflow-hidden">
              {select ? getLabel(select) : (placeholder ?? "Select")}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        {/* close button */}
        {paramName && searchParams.has(paramName) && (
          <Button
            type="button"
            size={"icon"}
            variant={"outline"}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete(paramName);
              params.delete("page");

              setValue("");
              setSelect(undefined);

              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <X className="size-4" /> <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
      <PopoverContent>
        <Command
          shouldFilter={false}
          onInput={(e: any) => setInput(e.target.value)}
        >
          <CommandInput />
          <CommandList>
            <CommandEmpty>No data found</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {data.map((item) => (
                <CommandItem
                  disabled={disabledKeys?.some((key) => getKey(item) === key)}
                  onSelect={(value) => {
                    setValue(value);
                    setSelect(item);
                    onValueChange?.(value);
                    setOpen(false);

                    if (paramName) {
                      const params = new URLSearchParams(searchParams);
                      params.set(paramName, String(getKey(item)));
                      router.push(`${pathname}?${params.toString()}`);
                    }
                  }}
                  key={getKey(item)}
                  value={getKey(item) as string}
                >
                  {getLabel(item)}
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === String(getKey(item))
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
