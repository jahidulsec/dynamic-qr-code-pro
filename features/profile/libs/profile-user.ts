// the signed-in user as the profile dialog needs it, passed down from the dashboard layout
export type ProfileUser = {
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
};

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
