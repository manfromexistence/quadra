"use client";

import type { ReactNode } from "react";
import { useRBAC } from "@/hooks/use-rbac";
import type { UserRole } from "@/lib/rbac";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  minimumRole?: UserRole;
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback = null,
  minimumRole,
}: RoleGuardProps) {
  const rbac = useRBAC();

  if (rbac.isLoading) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && rbac.role && !allowedRoles.includes(rbac.role)) {
    return <>{fallback}</>;
  }

  // Check minimum role level
  if (minimumRole && !rbac.isRoleAtLeast(minimumRole)) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (requiredPermission && !rbac.hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (requiredPermissions) {
    const hasAccess = requireAll
      ? rbac.hasAllPermissions(requiredPermissions)
      : rbac.hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
