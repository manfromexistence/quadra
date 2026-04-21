import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { projectMembers, projects } from "@/db/schema/projects";
import { normalizeEdmsRole } from "./rbac";
import type { DashboardSessionUser } from "./session";

export interface ProjectAccessScope {
  isAdmin: boolean;
  projectIds: string[];
}

export async function getProjectAccessScope(
  sessionUser: DashboardSessionUser,
): Promise<ProjectAccessScope> {
  return getProjectAccessScopeByUserId(sessionUser.id, sessionUser.role);
}

export async function getProjectAccessScopeByUserId(
  userId: string,
  knownRole?: string | null,
): Promise<ProjectAccessScope> {
  let role = knownRole ?? null;

  try {
    if (!role) {
      const [user] = await db
        .select({ role: userTable.role })
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);

      role = user?.role ?? null;
    }

    if (normalizeEdmsRole(role) === "admin") {
      return {
        isAdmin: true,
        projectIds: [],
      };
    }

    const [memberRows, ownedRows, clientRows] = await Promise.all([
      db
        .select({ projectId: projectMembers.projectId })
        .from(projectMembers)
        .where(eq(projectMembers.userId, userId)),
      db
        .select({ projectId: projects.id })
        .from(projects)
        .where(eq(projects.createdBy, userId)),
      db
        .select({ projectId: projects.id })
        .from(projects)
        .where(eq(projects.clientId, userId)),
    ]);

    const projectIds = Array.from(
      new Set([
        ...memberRows.map((row) => String(row.projectId)),
        ...ownedRows.map((row) => String(row.projectId)),
        ...clientRows.map((row) => String(row.projectId)),
      ]),
    );

    return {
      isAdmin: false,
      projectIds,
    };
  } catch (error) {
    console.error("Error getting project access scope:", error);
    // Return admin scope as fallback
    return {
      isAdmin: true,
      projectIds: [],
    };
  }
}

export async function canAccessProject(
  sessionUser: DashboardSessionUser,
  projectId: string,
): Promise<boolean> {
  const scope = await getProjectAccessScope(sessionUser);

  if (scope.isAdmin) {
    return true;
  }

  return scope.projectIds.includes(projectId);
}

export async function getFirstAccessibleProjectId(
  sessionUser: DashboardSessionUser,
): Promise<string | null> {
  const scope = await getProjectAccessScope(sessionUser);

  if (scope.isAdmin) {
    // For admins, get the first active project
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.status, "active"))
      .limit(1);

    return project?.id ?? null;
  }

  if (scope.projectIds.length === 0) {
    return null;
  }

  const firstProjectId = scope.projectIds[0];
  if (!firstProjectId) {
    return null;
  }

  // Get the first accessible project
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, firstProjectId))
    .limit(1);

  return project?.id ?? null;
}
