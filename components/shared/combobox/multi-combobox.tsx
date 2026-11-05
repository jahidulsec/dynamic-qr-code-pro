"use client";

import React from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

type MultiComboboxProps = Omit<
  React.ComponentProps<typeof ComboboxChipsInput>,
  "value" | "defaultValue" | "onChange" | "onValueChange"
> & {
  /** Every value that can be picked. */
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Shown when the search matches no option. */
  emptyText?: string;
};

/**
 * Searchable multi-value select over a fixed list of plain values, shown as
 * chips. Binds straight to a react-hook-form `Controller` array field:
 *
 * ```tsx
 * <MultiCombobox options={brands} value={field.value}
 *   onValueChange={field.onChange} aria-invalid={fieldState.invalid} />
 * ```
 */
function MultiCombobox({
  options,
  value,
  onValueChange,
  emptyText = "No results found.",
  disabled,
  className,
  placeholder,
  ...props
}: MultiComboboxProps) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      autoHighlight
      items={options}
      value={value}
      onValueChange={(next: string[]) => onValueChange(next)}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map(item => (
                <ComboboxChip key={item}>{item}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                disabled={disabled}
                placeholder={values.length ? undefined : placeholder}
                {...props}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { MultiCombobox };
export type { MultiComboboxProps };
