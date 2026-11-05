import { readdirSync } from "node:fs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Feature public API boundary (see .claude/rules/features.md).
 *
 * Outside a feature, only its entry points may be imported:
 *   "@/features/<name>"         -> features/<name>/index.ts  (client-safe)
 *   "@/features/<name>/server"  -> features/<name>/server.ts (server-only)
 * Inside a feature, its own files are imported directly, never through its own entry points.
 */
const features = readdirSync(new URL("./features", import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const DEEP_IMPORT_MESSAGE =
  'Import another feature through its public API: "@/features/<name>" (client-safe) or "@/features/<name>/server" (server-only). Export what you need from that feature\'s index.ts/server.ts.';

const featureBoundaries = [
  {
    files: ["**/*.{ts,tsx,mts,js,jsx,mjs}"],
    ignores: ["features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ regex: "^@/features/[^/]+/(?!server$).+", message: DEEP_IMPORT_MESSAGE }] },
      ],
    },
  },
  ...features.map((name) => ({
    files: [`features/${name}/**/*.{ts,tsx,mts,js,jsx,mjs}`],
    ignores: [`features/${name}/index.ts`, `features/${name}/server.ts`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { regex: `^@/features/(?!${name}/)[^/]+/(?!server$).+`, message: DEEP_IMPORT_MESSAGE },
            {
              regex: `^@/features/${name}(/server)?$`,
              message: `Inside the ${name} feature, import its files directly; its index.ts/server.ts are for other code only (avoids import cycles).`,
            },
          ],
        },
      ],
    },
  })),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "vendor/**",
  ]),
   {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  ...featureBoundaries,
]);

export default eslintConfig;
