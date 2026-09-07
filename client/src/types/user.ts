export type UserRole = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}
