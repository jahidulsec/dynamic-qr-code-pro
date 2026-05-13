export type AuthUser = {
  userId: string;
  name: string;
  role: AuthUserRole;
};

export type AuthUserRole = string;
