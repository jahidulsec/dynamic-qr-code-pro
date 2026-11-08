// plain, serializable rows passed from the settings pages to client components
export type MemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
};

export type InvitationRow = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  expired: boolean;
};

// pending invitations only, with expiry resolved at request time
export const toInvitationRows = (
  invitations: { id: string; email: string; role?: string | null; status: string; expiresAt: Date }[],
  formatDate: (date: Date) => string,
): InvitationRow[] => {
  const now = Date.now();
  return invitations
    .filter((invitation) => invitation.status === "pending")
    .map((invitation) => {
      const expiresAt = new Date(invitation.expiresAt);
      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role ?? "member",
        expiresAt: formatDate(expiresAt),
        expired: expiresAt.getTime() < now,
      };
    });
};

// placeholder until the settings server actions are wired up
export const PENDING_ACTION_MESSAGE = "This action isn't connected yet";
