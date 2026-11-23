/**
 * Promotes a verified user to platform admin, or demotes them with --revoke.
 *
 *   npm run admin:create -- --email owner@example.com
 *   npm run admin:create -- --email owner@example.com --revoke
 *
 * The person signs up through the normal flow and verifies their email first.
 * Exits 0 on success and 1 on any error.
 */
import "dotenv/config";
import { parseArgs } from "node:util";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { SUPERADMIN_ROLE } from "../lib/auth/admin-permissions";

const USER_ROLE = "user";
const USAGE = "Usage: npm run admin:create -- --email <email> [--revoke]";

class ScriptError extends Error {}

function parseOptions() {
  let values;
  try {
    ({ values } = parseArgs({
      options: { email: { type: "string" }, revoke: { type: "boolean", default: false } },
      strict: true,
      allowPositionals: false,
    }));
  } catch (error) {
    throw new ScriptError(`${error instanceof Error ? error.message : String(error)}\n${USAGE}`);
  }

  const email = values.email?.trim().toLowerCase();
  if (!email) throw new ScriptError(`--email is required.\n${USAGE}`);

  return { email, revoke: values.revoke };
}

async function main() {
  const { email, revoke } = parseOptions();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new ScriptError("DATABASE_URL is not set. Add it to .env or the environment.");

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerified: true, role: true },
    });

    if (!user) throw new ScriptError(`No user with email ${email}. They need to sign up first.`);

    const targetRole = revoke ? USER_ROLE : SUPERADMIN_ROLE;
    if (user.role === targetRole)
      throw new ScriptError(
        revoke ? `${user.email} is not an admin.` : `${user.email} is already an admin.`,
      );

    // demoting never needs a verified email; promoting does, so the address is proven to be theirs
    if (!revoke && !user.emailVerified)
      throw new ScriptError(`${user.email} hasn't verified their email. They need to verify it first.`);

    await prisma.user.update({ where: { id: user.id }, data: { role: targetRole } });

    console.log(revoke ? `${user.email} is no longer an admin.` : `${user.email} is now an admin.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    if (error instanceof ScriptError) console.error(`Error: ${error.message}`);
    else console.error("Error:", error);
    process.exit(1);
  },
);
