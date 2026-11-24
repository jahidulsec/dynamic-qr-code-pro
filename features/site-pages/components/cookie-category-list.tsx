"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { type CookieConsent, OPTIONAL_COOKIE_CATEGORIES } from "@/features/site-pages/constants";

type CookieCategoryListProps = {
  value: CookieConsent;
  onChange: (value: CookieConsent) => void;
};

/** Always-on essential row plus a toggle per optional category. */
export function CookieCategoryList({ value, onChange }: CookieCategoryListProps) {
  return (
    <ul className="divide-y rounded-xl border text-left">
      <li className="flex items-start gap-4 p-4">
        <Checkbox checked disabled aria-labelledby="cookie-essential" className="mt-1" />
        <div className="space-y-1">
          <p id="cookie-essential" className="font-medium text-foreground">
            Strictly necessary <span className="text-sm font-normal text-muted-foreground">(always on)</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Keep you signed in, remember your workspace and layout, and protect forms from abuse. The site can&apos;t
            work without them.
          </p>
        </div>
      </li>
      {OPTIONAL_COOKIE_CATEGORIES.map((category) => (
        <li key={category.id}>
          <label className="flex cursor-pointer items-start gap-4 p-4">
            <Checkbox
              className="mt-1"
              checked={value[category.id]}
              onCheckedChange={(checked) => onChange({ ...value, [category.id]: checked === true })}
            />
            <span className="space-y-1">
              <span className="block font-medium text-foreground">{category.label}</span>
              <span className="block text-sm text-muted-foreground">{category.description}</span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
