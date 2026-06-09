export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string | null;
  role: UserRole;
  isActive?: boolean;
}
