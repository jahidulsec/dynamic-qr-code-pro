"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = { label: string; value: string; disabled?: boolean };

type BaseProps = {
  data: SelectOption[];
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  /** shows "Loading..." instead of "No data." while the list is empty */
  pending?: boolean;
  /** shows a clear button when something is selected */
  clearable?: boolean;
  /** search param the selection is synced to; makes the select URL-driven */
  paramKey?: string;
  /** params removed whenever the URL-driven selection changes (e.g. pagination) */
  resetKeys?: string[];
  /** max labels shown in the trigger before collapsing to "N selected" (multiple only) */
  maxLabels?: number;
  "aria-label"?: string;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
};

type MultipleProps = BaseProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type SelectProps = SingleProps | MultipleProps;

/**
 * Single or multiple select. Pass `paramKey` to sync the selection with the
 * URL (multiple values are written as repeated params: `?tag=a&tag=b`),
 * otherwise use it controlled (`value`) or uncontrolled (`defaultValue`).
 */
function Select(props: SelectProps) {
  const {
    data,
    id,
    name,
    className,
    placeholder = "Select",
    disabled,
    pending,
    clearable = true,
    paramKey,
    resetKeys = ["page"],
    maxLabels = 2,
    multiple = false,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();

  const labelOf = (value: string) => data.find((item) => item.value === value)?.label ?? value;

  // URL-driven selection wins over controlled value
  const urlValue = paramKey
    ? multiple
      ? searchParams.getAll(paramKey)
      : searchParams.get(paramKey)
    : undefined;
  const value = paramKey ? urlValue : props.value;

  const writeUrl = (next: string | string[] | null) => {
    if (!paramKey) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramKey);
    for (const v of Array.isArray(next) ? next : next ? [next] : []) params.append(paramKey, v);
    for (const key of resetKeys) params.delete(key);
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  const handleChange = (next: unknown) => {
    if (multiple) {
      const values = Array.isArray(next) ? (next as string[]) : [];
      writeUrl(values);
      (props as MultipleProps).onValueChange?.(values);
    } else {
      const single = typeof next === "string" && next !== "" ? next : null;
      writeUrl(single);
      (props as SingleProps).onValueChange?.(single);
    }
  };

  const hasSelection = Array.isArray(value) ? value.length > 0 : Boolean(value);
  const showClear = clearable && !disabled && hasSelection && (paramKey || props.value !== undefined);

  const renderValue = (selected: unknown) => {
    if (Array.isArray(selected)) {
      if (selected.length === 0) return placeholder;
      if (selected.length > maxLabels) return `${selected.length} selected`;
      return selected.map((v) => labelOf(String(v))).join(", ");
    }
    return selected ? labelOf(String(selected)) : placeholder;
  };

  return (
    <div className={cn("flex items-center", className)} aria-busy={isNavigating}>
      <SelectRoot
        id={id}
        name={name}
        disabled={disabled}
        multiple={multiple}
        items={data}
        // base-ui treats `undefined` as uncontrolled, so keep null/[] for "nothing selected"
        value={value === undefined ? undefined : (value ?? null)}
        defaultValue={paramKey ? undefined : (props.defaultValue ?? undefined)}
        onValueChange={handleChange}
      >
        <SelectTrigger
          aria-label={props["aria-label"]}
          className={cn("w-full bg-background", showClear && "rounded-r-none")}
        >
          <SelectValue placeholder={placeholder}>{renderValue}</SelectValue>
        </SelectTrigger>

        <SelectContent alignItemWithTrigger={!multiple}>
          <SelectGroup>
            {data.length > 0 ? (
              data.map((item) => (
                <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
                  {item.label}
                </SelectItem>
              ))
            ) : (
              <SelectLabel>{pending ? "Loading..." : "No data."}</SelectLabel>
            )}
          </SelectGroup>
        </SelectContent>
      </SelectRoot>

      {showClear && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="-ml-px shrink-0 rounded-l-none"
          title="Clear"
          onClick={() => handleChange(multiple ? [] : null)}
        >
          <IconX />
          <span className="sr-only">Clear</span>
        </Button>
      )}
    </div>
  );
}

export { Select };
