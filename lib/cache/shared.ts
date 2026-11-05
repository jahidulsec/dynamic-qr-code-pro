import prisma from "@/config/db";
import { Prisma } from "@/generated/prisma/client";
import { connection } from "next/server";
import {
  applyCacheOptions,
  resolveCacheOptions,
  type ResolvedCacheOptions,
  type ServerCacheOptions,
} from "./cache";

/**
 * Shared plumbing for the `services/*` layer so each model service only has to
 * declare its Prisma query, not repeat the `use cache` / tag / lifetime wiring.
 */

type Client = typeof prisma;
// Prisma model names are PascalCase (`QrCode`); their client delegates are camelCase (`qrCode`)
type Model = Uncapitalize<Prisma.ModelName> & keyof Client;
type ReadMethod = "findUnique" | "findFirst" | "findMany" | "count" | "aggregate";

/** A read on one model, typed by the Prisma client: `{ model, method, args }`. */
export type ReadQuery = {
  [M in Model]: {
    [Op in ReadMethod]: {
      model: M;
      method: Op;
      args: Prisma.Args<Client[M], Op>;
    };
  }[ReadMethod];
}[Model];

const runQuery = ({ model, method, args }: ReadQuery): Promise<unknown> =>
  (prisma[model][method] as (args: unknown) => Promise<unknown>)(args);

/**
 * `use cache` only stores values React can serialize. Prisma `Decimal`s are
 * class instances, so store them as strings (what `JSON` would produce).
 */
const toSerializable = (value: unknown): unknown => {
  if (Prisma.Decimal.isDecimal(value)) return value.toString();
  if (Array.isArray(value)) return value.map(toSerializable);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, toSerializable(v)]),
    );
  }
  return value;
};

/**
 * The cache key is the serialized arguments (`query` and `cache`), so every
 * filter, select, take/skip and sort is part of the key automatically.
 */
const runCachedQuery = async (
  query: ReadQuery,
  cache: ResolvedCacheOptions,
): Promise<unknown> => {
  "use cache";
  applyCacheOptions(cache);
  return toSerializable(await runQuery(query));
};

/**
 * Run a read inside a `use cache` scope tagged with `baseTag` (plus any
 * `cacheOption.tags`), so writes through `mutate` bust it.
 *
 * Pass `cacheOption: { cache: false }` to skip caching entirely and read fresh
 * (e.g. for auth checks where a stale/cached row would be a correctness issue).
 *
 * @example
 * const qr = await cachedRead<QrCode | null>(
 *   { model: "qrCode", method: "findUnique", args: { where: { id } } },
 *   cacheTags.qrCodes,
 *   { tags: qrCodeTag(id) },
 * );
 */
export const cachedRead = async <Result>(
  query: ReadQuery,
  baseTag: string,
  cacheOption?: ServerCacheOptions,
): Promise<Result> => {
  // reads are request-time: the build never touches the database, and
  // auth-gated data never ends up in a prerendered shell
  await connection();

  return (
    cacheOption?.cache === false
      ? runQuery(query)
      : runCachedQuery(query, resolveCacheOptions(baseTag, cacheOption))
  ) as Promise<Result>;
};

export { mutate } from "./cache";
