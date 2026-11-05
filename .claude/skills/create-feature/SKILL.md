---
name: create-feature
description: Scaffold a new feature module under features/<name> (schemas, Prisma services with cache tags, "use server" loaders and actions, components) and expose it through a public index.ts / server.ts API. Use when the user asks to create, add or scaffold a feature/module/domain, or to expose an existing feature's API.
argument-hint: "<feature-name> [short description]"
---

# Create a feature

Build a new `features/<name>/` module that follows `.claude/rules/features.md`. `features/qr` is the reference implementation, so read the matching file there before writing each layer.

Arguments: `$ARGUMENTS` (feature name in kebab-case, plus an optional description). If the name or the data it manages is unclear, ask before scaffolding.

## 0. Plan

1. Pick the name: kebab-case, plural for collections (`organizations`), singular for a domain (`billing`).
2. List what the feature **owns**: Prisma models, routes under `app/`, and the actions users take.
3. List what it **consumes** from other features. Import only from `@/features/<other>` or `@/features/<other>/server`. If something you need isn't exported there, add it to that feature's entry file. Never deep-import.
4. Only create the layers you need. A feature with no DB has no `services/`, and a marketing feature may have only `components/` and `index.ts`.

## 1. Data (if the feature has models)

- Add the models to `prisma/schema.prisma` with `@@map("snake_case")`. Scope them by `organizationId` with `onDelete: Cascade` unless they are global.
- Run `npm run db:migrate -- --name <change>`. This also regenerates `generated/prisma`.
- Add cache tags to `lib/cache/cache-tags.ts`: `<model>s` and `<model>Count`, plus a per-record tag helper if detail reads should bust on their own.

## 2. `schemas/<name>-schema.ts` (client-safe)

Zod schemas for form input, list queries (`page`, `size`, filters with `.catch()` defaults) and ids. Export inferred types (`z.input` for form input, `z.output` for parsed values).

## 3. `services/<model>.ts` (server-only, private)

One file per Prisma model, copied from `features/qr/services/qr.ts`:

```ts
import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { ServerCacheOptions } from "@/lib/cache/cache";
import { cacheTags } from "@/lib/cache/cache-tags";
import { cachedRead, mutate } from "@/lib/cache/shared";

type RevalidateTags = (string | null | undefined)[];
const writeTags = (extra: RevalidateTags = []) => [cacheTags.things, cacheTags.thingCount, ...extra];

export const getThings = <T extends Prisma.ThingFindManyArgs>(
  args: Prisma.SelectSubset<T, Prisma.ThingFindManyArgs>,
  cacheOption?: ServerCacheOptions,
) =>
  cachedRead<Prisma.ThingGetPayload<T>[]>(
    { model: "thing", method: "findMany", args: args as Prisma.ThingFindManyArgs },
    cacheTags.things,
    cacheOption,
  );

export const createThing = <T extends Prisma.ThingCreateArgs>(
  args: Prisma.SelectSubset<T, Prisma.ThingCreateArgs>,
  revalidateTags?: RevalidateTags,
) => mutate(() => prisma.thing.create<T>(args), writeTags(revalidateTags));
```

Services hold no auth and no business rules. They only wrap Prisma calls and handle caching.

## 4. `libs/` (server reads)

- `libs/<name>-query.ts`: pure Prisma `select` objects, `where` builders and payload types, for example `ThingListItem = Prisma.ThingGetPayload<{ select: typeof thingListSelect }>`.
- `libs/<name>.ts`: starts with `"use server"`. These are the page loaders. Pattern:

```ts
export const getThings = async (organizationSlug: string, query: ThingQuery) => {
  try {
    const { page, size } = thingQuerySchema.parse(query);
    const { organization } = await requireOrganization(organizationSlug); // from @/features/qr/server
    const where = { organizationId: organization.id };
    const [data, count] = await Promise.all([
      findThings({ where, select: thingListSelect, skip: (page - 1) * size, take: size }),
      countThings({ where }),
    ]);
    return apiResponse.multi({ data, count });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
```

## 5. `actions/<verb>-<name>.ts` (`"use server"` mutations)

Each action runs these steps in order: zod parse, then `requireOrganization`, then permission checks (`isAdminRole`), then fresh reads for quota and invariants (`{ cache: false }`). Next comes the service write, scoped by `organization.id`, with Prisma `P2025` mapped to `APIError("NOT_FOUND")`. Finish with `refresh()` and `return apiResponse.single({ message, data })`, and wrap everything in `catch → apiResponse.error({ error })`. See `features/qr/actions/manage-qr.ts`.

## 6. `components/`

- Put `"use client"` only on components that need interactivity.
- Client components call actions inside `useTransition`, then `toast.success|error(result.message)`.
- Use the `components/ui` primitives (shadcn/base-ui) and `@tabler/icons-react`.
- Pages own URL state: they parse `searchParams` and pass `href`s and data down as props.

## 7. Expose the public API

Create `features/<name>/index.ts` (client-safe) and, if needed, `features/<name>/server.ts`:

```ts
// features/<name>/index.ts — public, client-safe API. Import from "@/features/<name>" only.
/* Components */
export { ThingTable } from "./components/thing-table";
/* Server actions & loaders ("use server") */
export { createThingAction } from "./actions/save-thing";
export { getThings } from "./libs/<name>";
/* Schemas, constants, types */
export { thingFormSchema, type ThingFormInput } from "./schemas/<name>-schema";
export type { ThingListItem } from "./libs/<name>-query";
```

```ts
// features/<name>/server.ts
import "server-only";

// Public, server-only API. Import from "@/features/<name>/server" only.
export { recordThing } from "./libs/record-thing";
```

Checklist:

- [ ] Use named re-exports only (no `export *`), and export only what is consumed outside the feature.
- [ ] Nothing in `index.ts` transitively imports `@/config/db`, `next/headers`, `node:*`, nodemailer or a `server.ts`, except through a `"use server"` file. Anything that does goes in `server.ts`.
- [ ] Async server components that read the session or DB go in `server.ts`.
- [ ] Files inside the feature import each other by direct path, never via `@/features/<name>`.

## 8. Wire routes

Add the route under `app/` and import only from `@/features/<name>` or `@/features/<name>/server`. Request-time data must sit under a `<Suspense>` boundary, because Cache Components is enabled.

## 9. Verify

```bash
npm run lint          # enforces the feature boundary (no deep imports)
npx tsc --noEmit
npx next build        # catches client/server-only leaks and prerender errors
```

Fix every boundary error by exporting from the owning feature's entry file. Don't silence the rule.

## Exposing an existing feature's API

If a feature has no `index.ts`/`server.ts` yet, or another module deep-imports it:

1. Run `grep -rn '"@/features/<name>/' app components lib features` and list every symbol used from outside the feature.
2. Sort each symbol into `index.ts` (client-safe) or `server.ts` (server-only) using the checklist above.
3. Rewrite the external imports to the entry points and merge duplicate import lines.
4. Run the verify steps.
