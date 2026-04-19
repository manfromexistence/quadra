import "server-only";
import { auth } from "@/lib/auth";
import {
  canAccessRoute,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isRoleAtLeast,
  type UserRole,
} from "@/lib/rbac";

export async function getServerSession() {
  return await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });
}

export async function getUserRole(): Promise<UserRole | undefined> {
  const session = await getServerSession();
  if (!session?.user) return undefined;
  return (session.user as { role?: UserRole }).role;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const userRole = (session.user as { role?: UserRole }).role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return session;
}

export async function requirePermission(permission: string) {
  const session = await requireAuth();
  const userRole = (session.user as { role?: UserRole }).role;

  if (!hasPermission(userRole, permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`);
  }

  return session;
}

export async function requireAnyPermission(permissions: string[]) {
  const session = await requireAuth();
  const userRole = (session.user as { role?: UserRole }).role;

  if (!hasAnyPermission(userRole, permissions)) {
    throw new Error(`Forbidden: Missing required permissions`);
  }

  return session;
}

export async function requireAllPermissions(permissions: string[]) {
  const session = await requireAuth();
  const userRole = (session.user as { role?: UserRole }).role;

  if (!hasAllPermissions(userRole, permissions)) {
    throw new Error(`Forbidden: Missing required permissions`);
  }

  return session;
}

export async function requireMinimumRole(minimumRole: UserRole) {
  const session = await requireAuth();
  const userRole = (session.user as { role?: UserRole }).role;

  if (!isRoleAtLeast(userRole, minimumRole)) {
    throw new Error(`Forbidden: Requires ${minimumRole} role or higher`);
  }

  return session;
}

export async function checkRouteAccess(route: string): Promise<boolean> {
  const userRole = await getUserRole();
  return canAccessRoute(userRole, route);
}
