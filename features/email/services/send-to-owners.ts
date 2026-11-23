import prisma from "@/config/db";
import { type SendEmailValues } from "@/features/email/schemas/email";
import { sendEmail } from "@/features/email/services/send-email";

type OwnerEmail = Omit<SendEmailValues, "to">;

/**
 * Sends `email` separately to every owner of the organization, so owners don't see each other's addresses.
 * Status emails are sent after the change is saved, so failures are logged and never thrown.
 */
export async function sendToOwners(organizationId: string, email: OwnerEmail) {
  try {
    // a fresh read: who owns the organization decides who hears about it
    const members = await prisma.member.findMany({
      where: { organizationId, role: { contains: "owner" } },
      select: { role: true, user: { select: { email: true } } },
    });
    // roles are a comma-separated list of keys; `contains` alone would also match e.g. "co-owner"
    const owners = members.filter((member) => member.role.split(",").some((key) => key.trim() === "owner"));

    const results = await Promise.allSettled(owners.map((owner) => sendEmail({ ...email, to: owner.user.email })));
    for (const result of results)
      if (result.status === "rejected") console.error(`Failed to send "${email.subject}" to an owner`, result.reason);
  } catch (error) {
    console.error(`Failed to send "${email.subject}" to owners`, error);
  }
}
