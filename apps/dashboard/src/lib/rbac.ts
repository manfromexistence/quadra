import type { Session } from "./auth";

export type UserRole = "admin" | "client" | "pmc" | "vendor" | "subcontractor" | "user";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  pmc: 80,
  client: 60,
  vendor: 40,
  subcontractor: 30,
  user: 10,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "manage:users",
    "manage:projects",
    "manage:documents",
    "manage:transmittals",
    "manage:workflows",
    "view:all",
    "edit:all",
    "delete:all",
    "approve:all",
  ],
  pmc: [
    "manage:projects",
    "manage:documents",
    "manage:transmittals",
    "manage:workflows",
    "view:all",
    "edit:documents",
    "approve:documents",
    "approve:transmittals",
  ],
  client: [
    "view:projects",
    "view:documents",
    "view:transmittals",
    "comment:documents",
    "approve:documents",
  ],
  vendor: [
    "view:assigned",
    "upload:documents",
    "edit:own",
    "view:transmittals",
  ],
  subcontractor: [
    "view:assigned",
    "upload:documents",
    "edit:own",
    "view:transmittals",
  ],
  user: [
    "view:assigned",
    "comment:documents",
  ],
};

export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole: UserRole | undefined, permissions: string[]): boolean {
  if (!userRole) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole | undefined, permissions: string[]): boolean {
  if (!userRole) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function isRoleAtLeast(userRole: UserRole | undefined, minimumRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

export function canAccessRoute(userRole: UserRole | undefined, route: string): boolean {
  if (!userRole) return false;

  // Admin can access everything
  if (userRole === "admin") return true;

  // Define route access rules
  const routeAccess: Record<string, UserRole[]> = {
    "/settings/users": ["admin"],
    "/settings/roles": ["admin"],
    "/projects/create": ["admin", "pmc"],
    "/projects/edit": ["admin", "pmc"],
    "/documents/approve": ["admin", "pmc", "client"],
    "/transmittals/create": ["admin", "pmc", "vendor", "subcontractor"],
    "/workflows/manage": ["admin", "pmc"],
  };

  // Check if route has specific access rules
  for (const [path, allowedRoles] of Object.entries(routeAccess)) {
    if (route.startsWith(path)) {
      return allowedRoles.includes(userRole);
    }
  }

  // Default: all authenticated users can access
  return true;
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: "Administrator",
    pmc: "Project Management Consultant",
    client: "Client",
    vendor: "Vendor",
    subcontractor: "Subcontractor",
    user: "User",
  };
  return displayNames[role] || role;
}

export function getUserRole(session: Session | null): UserRole | undefined {
  if (!session?.user) return undefined;
  return (session.user as { role?: UserRole }).role;
}
