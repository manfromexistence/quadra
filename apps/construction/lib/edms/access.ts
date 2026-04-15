import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectMembers, projects } from "@/db/schema/projects";
import { normalizeEdmsRole } from "./rbac";
import type { DashboardSessionUser } from "./session";

export interface ProjectAccessScope {
  isAdmin: boolean;
  projectIds: string[];
}

export async function getProjectAccessScope(
  sessionUser: DashboardSessionUser
): Promise<ProjectAccessScope> {
  if (normalizeEdmsRole(sessionUser.role) === "admin") {
    return {
      isAdmin: true,
      projectIds: [],
    };
  }

  const [memberRows, ownedRows, clientRows] = await Promise.all([
    db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, sessionUser.id)),
    db
      .select({ projectId: projects.id })
      .from(projects)
      .where(eq(projects.createdBy, sessionUser.id)),
    db
      .select({ projectId: projects.id })
      .from(projects)
      .where(eq(projects.clientId, sessionUser.id)),
  ]);

  const projectIds = Array.from(
    new Set([
      ...memberRows.map((row) => String(row.projectId)),
      ...ownedRows.map((row) => String(row.projectId)),
      ...clientRows.map((row) => String(row.projectId)),
    ])
  );

  return {
    isAdmin: false,
    projectIds,
  };
}

export async function canAccessProject(
  sessionUser: DashboardSessionUser,
  projectId: string
): Promise<boolean> {
  const scope = await getProjectAccessScope(sessionUser);

  if (scope.isAdmin) {
    return true;
  }

  return scope.projectIds.includes(projectId);
}
