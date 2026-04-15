"use client";

import { useUserQuery } from "@/hooks/use-user";
import {
  type UserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  canAccessRoute,
  getRoleDisplayName,
} from "@/lib/rbac";

export function useRBAC() {
  const { data: user, isLoading } = useUserQuery();
  const userRole = (user as { role?: UserRole })?.role;

  return {
    role: userRole,
    roleDisplayName: userRole ? getRoleDisplayName(userRole) : undefined,
    isLoading,
    hasPermission: (permission: string) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userRole, permissions),
    isRoleAtLeast: (minimumRole: UserRole) => isRoleAtLeast(userRole, minimumRole),
    canAccessRoute: (route: string) => canAccessRoute(userRole, route),
    isAdmin: userRole === "admin",
    isPMC: userRole === "pmc",
    isClient: userRole === "client",
    isVendor: userRole === "vendor",
    isSubcontractor: userRole === "subcontractor",
    isUser: userRole === "user",
  };
}
