import { UserRole } from "../types";

/**
 * Check if user has admin role
 */
export const isAdmin = (role: string | null): boolean => {
  return role === UserRole.ADMIN;
};

/**
 * Get role display name
 */
export const getRoleDisplay = (role: string): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "Quản trị viên";
    default:
      return "Người dùng";
  }
};
