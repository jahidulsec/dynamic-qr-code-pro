---
paths:
  - "features/**"
  - "app/**"
  - "lib/**"
  - "components/**"
---

# Feature modules & public API

Business logic lives in `features/<name>/`. Each feature is a black box with **two entry points**; everything else in the folder is private.

| Import path | File | Contents | Who may import it |
| --- | --- | --- | --- |
| `@/features/<name>` | `index.ts` | **Client-safe only:** `"use client"` components, pure server components, server actions & `"use server"` loaders, zod schemas, constants, types | Anyone (server or client) |
| `@/features/<name>/server` | `server.ts` | **Server-only:** starts with `import "server-only";` — async server components that read request data, services/guards that touch Prisma, `headers()`, `node:*`, nodemailer… | Server code only (pages, layouts, route handlers, other features' server code) |

Rules (enforced by `no-restricted-imports` in `eslint.config.mjs`; run `npm run lint`):

1. **Outside a feature, never deep-import it.** `@/features/qr/libs/qr` ✗ → `@/features/qr` ✓. If something is missing, export it from that feature's `index.ts`/`server.ts` — don't reach in.
2. **Inside a feature, never import its own entry points** (`@/features/qr` from `features/qr/**` ✗). Use the direct file path (`@/features/qr/services/qr`) — barrels importing themselves create cycles.
3. **`index.ts` must stay client-safe.** If an export transitively imports `@/config/db`, `@/lib/auth/auth` (outside a `"use server"` file), `next/headers`, `node:*` or another `server.ts`, it belongs in `server.ts`. `"use server"` modules are fine in `index.ts` — the client only receives action references.
4. **Export the minimum.** Only what other features/routes actually consume. Internal helpers (row actions, query builders, Prisma selects) stay private.
5. **Named re-exports, no `export *`**, so the public surface is reviewable in one file. Group by kind (Components / Actions & loaders / Schemas, constants, types).
6. A feature with nothing client-safe (e.g. `email`) has only `server.ts`. A feature with nothing server-only has only `index.ts`.
7. Sub-features (`features/auth/sign-in/…`) share the parent's entry points — there is no `@/features/auth/sign-in`.
8. Shared, feature-agnostic code goes in `components/shared`, `lib/`, `utils/` or `types/` — not in a feature that others then depend on.

## Folder layout inside a feature

```
features/<name>/
  index.ts            # public, client-safe API
  server.ts           # public, server-only API (import "server-only")
  constants.ts        # quotas, page sizes, enums used across the feature
  schemas/            # zod schemas + inferred types (client-safe)
  services/           # thin Prisma wrappers via cachedRead / mutate (server-only, private)
  libs/<name>.ts      # "use server" loaders: validate → authorize → call services → apiResponse
  libs/*.ts           # pure helpers: Prisma `select`/`where` builders, aggregations
  actions/            # "use server" mutations: validate → authorize → service write → refresh() → apiResponse
  components/         # React components (mark client ones with "use client")
```

## Layer conventions (match existing code in `features/qr`)

- **services/** wrap one Prisma model each; reads go through `cachedRead(query, cacheTags.<model>, cacheOption)`, writes through `mutate(fn, [cacheTags.<model>, cacheTags.<model>Count, ...revalidateTags])`. Add new tags to `lib/cache/cache-tags.ts`.
- **Loaders & actions** always: parse input with zod → `requireOrganization(slug)` (or session check) → scope every query by `organization.id` → return `apiResponse.single|multi(...)`; wrap in `try/catch` returning `apiResponse.error({ error })`. Throw user-facing errors as `new APIError("NOT_FOUND" | "FORBIDDEN" | …, { message })`.
- Security-sensitive reads (quota, permissions) use `{ cache: false }`.
- Actions call `refresh()` from `next/cache` after a successful write.
- Client components call actions inside `useTransition` and show `toast.success/error(result.message)`.

To scaffold a new feature, use the `create-feature` skill.
