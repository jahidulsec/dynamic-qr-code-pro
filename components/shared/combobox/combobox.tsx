"use client";

import React from "react";

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
import { useDebounce } from "@/hooks/use-debounce";
import { IconCheck, IconSelector } from "@tabler/icons-react";
import { SectionLoader } from "../skeleton/section";

type FetchParams = {
  page: number;
  size: number;
  search?: string;
};

type FetchResult<T> = {
  success: boolean;
  message?: string;
  data?: T[];
};

interface AsyncComboboxProps<T> {
  fetcher: (params: FetchParams) => Promise<FetchResult<T>>;
  placeholder?: string;
  onValueChange?: (value: string, item: T) => void;
  defaultValue?: string;
  getLabel: (item: T) => string;
  getKey: (item: T) => React.Key;
  disabledKeys?: string[];
  className?: string;
}

export default function Combobox<T>({
  fetcher,
  onValueChange,
  getKey,
  getLabel,
  placeholder = "Select an option",
  defaultValue,
  disabledKeys,
  className
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [select, setSelect] = React.useState<T>();
  const [data, setData] = React.useState<T[]>([]);
  const [input, setInput] = React.useState(defaultValue ?? "");
  const search = useDebounce(input);

  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const res = await fetcher({
        page: 1,
        size: 10,
        search,
      });

      if (res.success) {
        setData(res.data ?? []);

        if (defaultValue && search === defaultValue) {
          setSelect(res.data?.[0]);
        }
      }
    });
  }, [search, fetcher]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between overflow-hidden", className)}
          />
        }
      >
        <span className="truncate text-left">
          {select ? getLabel(select) : placeholder}
        </span>
        <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={input} onValueChange={setInput} />
          <CommandList>
            {pending ? (
              <SectionLoader />
            ) : (
              <>
                <CommandEmpty>No data found</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {data.map(item => {
                    const key = String(getKey(item));
                    return (
                      <CommandItem
                        key={key}
                        value={key}
                        disabled={disabledKeys?.includes(key)}
                        onSelect={selected => {
                          setValue(selected);
                          setSelect(item);
                          onValueChange?.(selected, item);
                          setOpen(false);
                        }}
                      >
                        {getLabel(item)}
                        <IconCheck
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === key ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
