"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
import {
  mergeOptions,
  OPTIONS_LIMIT,
  SEARCH_DEBOUNCE_MS,
  SelectOption,
  ServerLoadParams,
  ServerOption,
  toOption,
} from "./server-combobox";
import { ApiResponse } from "@/utils/response";

type ServerMultiComboboxProps<T extends SelectOption = SelectOption> = Omit<
  React.ComponentProps<typeof ComboboxChipsInput>,
  "value" | "defaultValue" | "onChange" | "onValueChange"
> & {
  /** Same loader contract as `ServerCombobox`. */
  load: (params: ServerLoadParams) => Promise<ApiResponse<ServerOption<T>[]>>;
  /** Also search on the server as the user types (debounced). Default on. */
  searchable?: boolean;
  /** Max options shown in the list at once. Defaults to `OPTIONS_LIMIT`. */
  limit?: number;
  /** Selected values. */
  value: string[];
  /**
   * Called with the new values and the selected options; an option is only a
   * plain `{ value, label }` while it isn't loaded yet.
   */
  onValueChange: (value: string[], options: T[]) => void;
  /** Shown as placeholder and empty text while the options load. */
  loadingText?: string;
  /** Shown when the search matches no option. */
  emptyText?: string;
};

/**
 * Searchable multi-value select whose options are loaded on the client from a
 * server action, shown as chips. The multi-value sibling of `ServerCombobox`;
 * binds straight to a react-hook-form `Controller` array field:
 *
 * ```tsx
 * <ServerMultiCombobox load={loadProducts} value={field.value}
 *   onValueChange={field.onChange} onBlur={field.onBlur}
 *   aria-invalid={fieldState.invalid} />
 * ```
 */
function ServerMultiCombobox<T extends SelectOption = SelectOption>({
  load,
  searchable = true,
  limit = OPTIONS_LIMIT,
  value,
  onValueChange,
  loadingText = "Loading...",
  emptyText = "No results found.",
  disabled,
  className,
  placeholder,
  ...props
}: ServerMultiComboboxProps<T>) {
  const anchor = useComboboxAnchor();
  const [loaded, setLoaded] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searching, setSearching] = useState(0);

  // Keep the first loader, even if the caller passes an inline one.
  const loadRef = useRef(load);
  const initialValue = useRef(value);
  const alive = useRef(true);
  // Values and searches already sent, so each goes to the server once.
  const requested = useRef(new Set<string>());
  const searched = useRef(new Set<string>());
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Loads options and merges them into the list.
  const fetchInto = useCallback(
    (params: ServerLoadParams) =>
      loadRef
        .current(params)
        .then(res => {
          if (!alive.current) return;
          if (res.success) {
            const next = res.data.map(item => toOption<T>(item));
            setLoaded(prev => mergeOptions(prev, next));
          } else toast.error(res.message);
        })
        .catch(() => {
          if (alive.current) toast.error("Failed to load options.");
        }),
    [],
  );

  useEffect(() => {
    alive.current = true;
    const current = initialValue.current;
    current.forEach(v => requested.current.add(v));

    fetchInto(current.length ? { values: current } : {}).finally(() => {
      if (alive.current) setIsLoading(false);
    });

    return () => {
      alive.current = false;
      clearTimeout(searchTimer.current);
    };
  }, [fetchInto]);

  // Values set after mount (e.g. a form reset) that aren't loaded yet: fetch
  // them so the chips show their labels, not the raw values.
  useEffect(() => {
    if (isLoading) return;
    const missing = value.filter(
      v =>
        !requested.current.has(v) && !loaded.some(option => option.value === v),
    );
    if (!missing.length) return;
    missing.forEach(v => requested.current.add(v));
    fetchInto({ values: missing });
  }, [value, loaded, isLoading, fetchInto]);

  // Keep every selected value pickable, even before it is loaded.
  const options = useMemo(() => {
    const missing = value
      .filter(v => !loaded.some(option => option.value === v))
      .map(v => toOption<T>(v));
    return missing.length ? [...missing, ...loaded] : loaded;
  }, [loaded, value]);

  const selected = value
    .map(v => options.find(option => option.value === v))
    .filter((option): option is T => !!option);

  const handleInputChange = (input: string) => {
    if (!searchable) return;
    clearTimeout(searchTimer.current);

    const query = input.trim();
    const key = query.toLowerCase();
    if (!query || searched.current.has(key)) return;

    searchTimer.current = setTimeout(() => {
      searched.current.add(key);
      setSearching(n => n + 1);
      fetchInto({ search: query }).finally(() => {
        if (alive.current) setSearching(n => n - 1);
      });
    }, SEARCH_DEBOUNCE_MS);
  };

  const isBusy = isLoading || searching > 0;

  return (
    <Combobox
      multiple
      autoHighlight
      items={options}
      limit={limit}
      value={selected}
      onValueChange={(next: T[]) =>
        onValueChange(
          next.map(option => option.value),
          next,
        )
      }
      onInputValueChange={handleInputChange}
      itemToStringLabel={(option: T) => option.label}
      itemToStringValue={(option: T) => option.value}
      isItemEqualToValue={(a: T, b: T) => a.value === b.value}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)}>
        <ComboboxValue>
          {(values: T[]) => (
            <>
              {values.map(option => (
                <ComboboxChip key={option.value}>{option.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                data-slot="server-multi-combobox"
                disabled={disabled}
                placeholder={
                  values.length ? undefined : isLoading ? loadingText : placeholder
                }
                {...props}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{isBusy ? loadingText : emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(option: T) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { ServerMultiCombobox };
export type { ServerMultiComboboxProps };
