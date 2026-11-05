"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { IconPlus } from "@tabler/icons-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/utils/response";
import { Button } from "@/components/ui/button";

/** How many records a record picker fetches and shows at a time. */
export const OPTIONS_LIMIT = 20;

type SelectOption = { value: string; label: string };

/** A plain value, or an option that may carry extra fields (e.g. a product's rate). */
type ServerOption<T extends SelectOption = SelectOption> = string | T;

const toOption = <T extends SelectOption>(item: ServerOption<T>): T =>
  (typeof item === "string" ? { value: item, label: item } : item) as T;

const byLabel = (a: SelectOption, b: SelectOption) =>
  a.label.localeCompare(b.label);

/** Adds the options not already in `prev`, keeping its order. */
const mergeOptions = <T extends SelectOption>(prev: T[], next: T[]) => {
  const fresh = next.filter(
    option => !prev.some(o => o.value === option.value),
  );
  return fresh.length ? [...prev, ...fresh] : prev;
};

const SEARCH_DEBOUNCE_MS = 300;

/**
 * What `ServerCombobox` asks its loader for: a search, or the first page plus
 * the selected `values`. Loaders build their rows with `findOptionRows`.
 */
type ServerLoadParams = {
  /** Text typed into the input. */
  search?: string;
  /** Values that must be included in the result (e.g. the current selection). */
  values?: string[];
};

/**
 * Wraps a loader so list loads made together share one request: calls in the
 * same tick are batched (their `values` merged) and later calls reuse it while
 * in flight. Use it for pickers mounted once per line item, so rows mounting
 * together (an edit form, quick "Add line" clicks) don't each hit the server.
 * Searches always go straight through.
 */
function shareInFlight<R>(
  load: (params: ServerLoadParams) => Promise<R>,
): (params?: ServerLoadParams) => Promise<R> {
  let batch: {
    values: Set<string>;
    sent: boolean;
    request: Promise<R>;
  } | null = null;

  return (params = {}) => {
    if (params.search) return load(params);

    const values = params.values ?? [];
    const covered =
      batch && (!batch.sent || values.every(v => batch!.values.has(v)));

    if (!batch || !covered) {
      const current: NonNullable<typeof batch> = {
        values: new Set(),
        sent: false,
        request: Promise.resolve().then(() => {
          current.sent = true;
          const all = [...current.values];
          return load(all.length ? { values: all } : {});
        }),
      };
      current.request.finally(() => {
        if (batch === current) batch = null;
      });
      batch = current;
    }

    values.forEach(v => batch!.values.add(v));
    return batch.request;
  };
}

/** Props handed to `renderCreate` to drive the "create new" sheet / dialog. */
type ServerComboboxCreateProps<T extends SelectOption = SelectOption> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Call with the saved record to add it to the list and select it. */
  onCreated: (option: ServerOption<T>) => void;
};

type ServerComboboxProps<T extends SelectOption = SelectOption> = Omit<
  React.ComponentProps<typeof ComboboxInput>,
  "value" | "defaultValue" | "onChange" | "onValueChange"
> & {
  /**
   * Server action returning the options, as plain values or `{ value, label }`.
   * Called on mount with the selected value in `values`, again for a value set
   * later that isn't loaded, and per search when `searchable`.
   */
  load: (params: ServerLoadParams) => Promise<ApiResponse<ServerOption<T>[]>>;
  /**
   * Also search on the server as the user types (debounced), merging matches
   * into the loaded list, since `load` returns only a first page. Default on.
   */
  searchable?: boolean;
  /** Max options shown in the list at once. Defaults to `OPTIONS_LIMIT`. */
  limit?: number;
  /** Selected value; an empty string means nothing is selected. */
  value: string;
  /**
   * Called with the new value and, when picked from the list, the full loaded
   * option — use it to fill dependent fields (e.g. a line's rate and UOM).
   */
  onValueChange: (value: string, option: T | null) => void;
  /** Shown as placeholder and empty text while the options load. */
  loadingText?: string;
  /** Shown when the search matches no option. */
  emptyText?: string;
  /** Label of the footer button that opens `renderCreate`. */
  createLabel?: string;
  /** Renders the create sheet / dialog; adds a footer button when set. */
  renderCreate?: (props: ServerComboboxCreateProps<T>) => React.ReactNode;
};

/**
 * Searchable single-value select whose options are loaded on the client from a
 * server action. Same `""` ⇄ nothing-selected contract as `OptionCombobox`, so
 * it binds straight to a react-hook-form `Controller` field:
 *
 * ```tsx
 * <ServerCombobox load={loadCustomers} value={field.value}
 *   onValueChange={field.onChange} ref={field.ref} onBlur={field.onBlur}
 *   aria-invalid={fieldState.invalid} />
 * ```
 */
function ServerCombobox<T extends SelectOption = SelectOption>({
  load,
  searchable = true,
  limit = OPTIONS_LIMIT,
  value,
  onValueChange,
  loadingText = "Loading...",
  emptyText = "No results found.",
  createLabel = "Create new",
  renderCreate,
  disabled,
  className,
  placeholder,
  ...props
}: ServerComboboxProps<T>) {
  const [loaded, setLoaded] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searching, setSearching] = useState(0);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
    if (current) requested.current.add(current);

    fetchInto(current ? { values: [current] } : {}).finally(() => {
      if (alive.current) setIsLoading(false);
    });

    return () => {
      alive.current = false;
      clearTimeout(searchTimer.current);
    };
  }, [fetchInto]);

  // A value set after mount (e.g. a form reset to a saved draft) that isn't
  // loaded yet: fetch it so the input shows its label, not the raw value.
  useEffect(() => {
    if (isLoading || !value || requested.current.has(value)) return;
    if (loaded.some(option => option.value === value)) return;
    requested.current.add(value);
    fetchInto({ values: [value] });
  }, [value, loaded, isLoading, fetchInto]);

  const options = useMemo(
    () =>
      // Keep the current value pickable while loading, or when it is no longer
      // in the list (e.g. an inactive party on an older draft), so the input
      // never shows blank.
      value && !loaded.some(option => option.value === value)
        ? [toOption<T>(value), ...loaded]
        : loaded,
    [loaded, value],
  );

  const selected = options.find(option => option.value === value) ?? null;

  const handleCreated = (item: ServerOption<T>) => {
    const option = toOption<T>(item);
    setLoaded(prev =>
      prev.some(o => o.value === option.value)
        ? prev
        : [...prev, option].sort(byLabel),
    );
    onValueChange(option.value, option);
  };

  // The list filters on the client as the user types; with `searchable`, also
  // ask the server (debounced) for matches beyond the loaded page.
  const handleInputChange = (input: string) => {
    if (!searchable) return;
    clearTimeout(searchTimer.current);

    const query = input.trim();
    const key = query.toLowerCase();
    // Picking an option fills the input with its label; that isn't a search.
    if (!query || input === selected?.label || searched.current.has(key))
      return;

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
    <>
      <Combobox
        items={options}
        limit={limit}
        value={selected}
        onValueChange={(next: T | null) =>
          onValueChange(next?.value ?? "", next)
        }
        onInputValueChange={handleInputChange}
        itemToStringLabel={(option: T) => option.label}
        itemToStringValue={(option: T) => option.value}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <ComboboxInput
          data-slot="server-combobox"
          disabled={disabled}
          placeholder={isLoading ? loadingText : placeholder}
          className={cn("w-full", className)}
          {...props}
        />
        <ComboboxContent>
          <ComboboxEmpty>{isBusy ? loadingText : emptyText}</ComboboxEmpty>
          <ComboboxList>
            {(option: T) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          {renderCreate && (
            <>
              <ComboboxSeparator className="mx-0 my-0" />
              <div className="p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                >
                  <IconPlus data-icon="inline-start" />
                  {createLabel}
                </Button>
              </div>
            </>
          )}
        </ComboboxContent>
      </Combobox>

      {renderCreate?.({
        open: createOpen,
        onOpenChange: setCreateOpen,
        onCreated: handleCreated,
      })}
    </>
  );
}

export { ServerCombobox, shareInFlight, toOption, mergeOptions, SEARCH_DEBOUNCE_MS };
export type {
  SelectOption,
  ServerComboboxProps,
  ServerComboboxCreateProps,
  ServerLoadParams,
  ServerOption,
};
