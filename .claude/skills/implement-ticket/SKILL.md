---
name: implement-ticket
description: Implement a ticket from docs/tickets (T-01 … T-27) end to end — read the ticket, its spec sections and findings, check its dependencies, plan, write the code following the features/* rules, verify with lint/tsc/build, and tick its "Done when" boxes. Use when the user says "implement T-08", "do ticket 12", "work on the next ticket", or names a ticket file.
argument-hint: "<T-NN | ticket path | next> [--commit]"
---

# Implement a ticket

Arguments: `$ARGUMENTS` — a ticket id (`T-08`, `8`, `08`), a path to a ticket file, or `next`. Add `--commit` to commit when done.

Tickets live in `docs/tickets/<NN-spec-folder>/T-NN-<slug>.md`; the index, dependency graph and spec findings (F1–F13) are in `docs/tickets/README.md`. Specs are in `docs/specs/`.

## 1. Find the ticket

- Id given: `ls docs/tickets/*/T-<NN>-*.md` (zero-pad to two digits).
- `next`: walk the README index in order and pick the first ticket whose "Done when" boxes aren't all ticked **and** whose dependencies are all done (step 2). Tell the user which one you picked and why.
- Nothing found or ambiguous: list the candidates and ask.

## 2. Check dependencies

Read the ticket's header table (`Phase | Size | Specs | Depends on`). For each dependency, open its ticket file:

- **Done** = every `- [ ]` under "Done when" is `- [x]`.
- If a dependency isn't done, don't trust the box alone — grep the code for what it should have delivered (models, exports, routes). If it really is missing, stop and tell the user which ticket blocks this one; offer to implement the blocker first. Don't stub another ticket's work.

## 3. Gather context

Read in full before writing any code:

1. The ticket file: scope bullets, "Done when" checklist, any "Related findings" table.
2. Every linked spec — at least the sections the ticket touches and the spec's **Acceptance criteria**.
3. Findings in `docs/tickets/README.md` that name this ticket. **Findings override the spec** where they disagree (e.g. F1 replaces the spec's sign-out step in T-06).
4. `.claude/rules/features.md`, plus the existing code the ticket changes. Use `features/qr` as the reference implementation for any new layer.

If a finding is marked **Needs a decision** (e.g. F6), or the spec has a relevant open question, ask the user with AskUserQuestion — give the recommendation from the README as the first option — before coding.

## 4. Plan

Write a short plan for the user: files to add/change, schema or migration changes, new exports on each feature's `index.ts`/`server.ts`, and how each "Done when" item will be met. For **S** tickets, state the plan and continue. For **M/L** tickets or anything touching `prisma/schema.prisma`, auth config, or deleting behaviour, wait for a go-ahead.

Stay inside the ticket's scope. If you spot work that belongs to another ticket, note it, don't do it.

## 5. Implement

Follow the project conventions:

- Feature boundaries per `.claude/rules/features.md`: import other features only via `@/features/<name>` or `@/features/<name>/server`; inside a feature, use direct paths. Export the minimum, named re-exports only.
- New feature module → follow the `create-feature` skill.
- Loaders/actions: zod parse → guard (`requireOrganization` / `requireAdmin` / session) → scope by id → `apiResponse.*`; throw `new APIError(...)` for user-facing errors; actions call `refresh()` after writes.
- When wrapping a resolver like `requireOrganization` in try/catch, catch only `APIError` and rethrow everything else.
- Services go through `cachedRead` / `mutate` with tags from `lib/cache/cache-tags.ts`; security-sensitive reads use `{ cache: false }`.
- Schema changes: edit `prisma/schema.prisma`, then `npm run db:migrate -- --name <change>`. Ask before running a migration against a database you haven't confirmed is local.
- Side effects that must not fail the main operation (emails, notifications) are wrapped and logged, never thrown — tickets call this out as "a send failure is logged and never fails …".
- Match the surrounding code's style; don't refactor unrelated code.

## 6. Verify

```bash
npm run lint
npx tsc --noEmit
npx next build
```

Fix every error you introduced (boundary errors: export from the owning feature, don't silence the rule). Then go through each "Done when" item and confirm it with evidence — a code path you can point to, a command output, or a manual check with the `run` skill when the item is about UI or runtime behaviour. If an item can't be verified here (e.g. needs SMTP or two concurrent admins), say so and explain how the code satisfies it.

## 7. Close out

1. Tick each verified box in the ticket file (`- [ ]` → `- [x]`). Leave unverified boxes unticked and say why.
2. If the implementation deviated from the ticket or spec, add a short `**Notes**` section at the end of the ticket file explaining what and why.
3. Report to the user: what changed (file links), verification results with any failures quoted, unticked boxes, and follow-ups for other tickets.
4. Commit only if `--commit` was passed or the user asks. Use the repo's style — `feat: <summary>` / `fix: …` / `chore: …`, lower-case, no ticket prefix unless the user wants one — and include the ticket file changes in the same commit. If on `main`, branch first.
