import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../generated/prisma/client"
import { env } from "@/lib/env"

const createPrismaClient = () => {
  const adapter = new PrismaMariaDb(env.DATABASE_URL)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

export default prisma

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
