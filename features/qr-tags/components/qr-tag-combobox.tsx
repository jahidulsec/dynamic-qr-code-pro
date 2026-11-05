"use client";

import {
  ServerCombobox,
  shareInFlight,
  type SelectOption,
  type ServerComboboxProps,
  type ServerLoadParams,
} from "@/components/shared/combobox/server-combobox";
import { getQrTagOptions } from "@/features/qr-tags/libs/qr-tags";

type QrTagComboboxProps = Omit<
  ServerComboboxProps,
  "load" | "renderCreate" | "createLabel" | "loadingText" | "emptyText"
> & {
  organizationSlug: string;
};

// one shared loader per organization, so pickers mounting together make one request
const loaders = new Map<string, (params?: ServerLoadParams) => ReturnType<typeof getQrTagOptions>>();

const loadQrTags = (organizationSlug: string) => {
  let load = loaders.get(organizationSlug);
  if (!load) {
    load = shareInFlight((params) => getQrTagOptions(organizationSlug, params));
    loaders.set(organizationSlug, load);
  }
  return load;
};

export function QrTagCombobox({ organizationSlug, placeholder, ...props }: QrTagComboboxProps) {
  return (
    <ServerCombobox<SelectOption>
      load={loadQrTags(organizationSlug)}
      placeholder={placeholder ?? "Select tag"}
      loadingText="Loading tags..."
      emptyText="No tag found."
      {...props}
    />
  );
}
