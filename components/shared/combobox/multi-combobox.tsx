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
  /**
   * Lets the typed text be added as a new value. Receives the raw text and
   * returns the value to add, or "" to offer nothing (defaults to trimming).
   */
  creatable?: boolean | ((input: string) => string);
};

/**
 * Searchable multi-value select over a list of plain values, shown as chips.
 * With `creatable`, the typed text can be added as a new value. Binds straight to a react-hook-form `Controller` array field:
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
  creatable = false,
  disabled,
  className,
  placeholder,
  ...props
}: MultiComboboxProps) {
  const anchor = useComboboxAnchor();
  const [query, setQuery] = React.useState("");

  // picked values stay listed even when they aren't options (e.g. ones created earlier)
  const known = [...new Set([...options, ...value])];
  const toCreate = typeof creatable === "function" ? creatable : (input: string) => input.trim();
  const candidate = creatable ? toCreate(query) : "";
  const isNew = !!candidate && !known.includes(candidate);
  const items = isNew ? [...known, candidate] : known;

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      onValueChange={(next: string[]) => {
        onValueChange(next);
        setQuery("");
      }}
      inputValue={query}
      onInputValueChange={setQuery}
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
              {isNew && item === candidate ? `Add "${item}"` : item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { MultiCombobox };
export type { MultiComboboxProps };
