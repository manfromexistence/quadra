"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projectMembers, projects } from "@/db/schema/projects";
import { logEdmsActivity } from "@/lib/edms/notifications";
import { normalizeEdmsRole } from "@/lib/edms/rbac";
import {
  actionFromError,
  actionOk,
  createEdmsId,
  normalizeOptionalString,
  parseOptionalDate,
  requireActionSessionUser,
} from "./_edms";

interface CreateProjectInput {
  name: string;
  projectNumber?: string;
  location?: string;
  description?: string;
  status: "active" | "on-hold" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
  images?: string[];
}

interface AssignProjectMemberInput {
  projectId: string;
  userId: string;
  role: "admin" | "client" | "pmc" | "vendor" | "contractor" | "subcontractor" | "user";
}

export async function createProject(input: CreateProjectInput) {
  try {
    const sessionUser = await requireActionSessionUser();

    if (normalizeEdmsRole(sessionUser.role) !== "admin") {
      throw new Error("Only administrators can create projects.");
    }

    const now = new Date();
    const projectId = createEdmsId("project");

    await db.insert(projects).values({
      id: projectId,
      name: input.name.trim(),
      projectNumber: normalizeOptionalString(input.projectNumber),
      location: normalizeOptionalString(input.location),
      description: normalizeOptionalString(input.description),
      status: input.status,
      startDate: parseOptionalDate(input.startDate),
      endDate: parseOptionalDate(input.endDate),
      images: input.images?.length ? JSON.stringify(input.images) : null,
      createdAt: now,
      updatedAt: now,
      createdBy: sessionUser.id,
    });

    await db.insert(projectMembers).values({
      id: createEdmsId("project-member"),
      projectId,
      userId: sessionUser.id,
      role: "admin",
      assignedAt: now,
      assignedBy: sessionUser.id,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId,
      action: "project_created",
      entityType: "project",
      entityId: projectId,
      entityName: input.name.trim(),
      description: "Created new project workspace.",
    });

    revalidatePath("/projects");

    return actionOk({ id: projectId });
  } catch (error) {
    return actionFromError(error, "Unable to create the project.");
  }
}

export async function assignProjectMember(input: AssignProjectMemberInput) {
  try {
    const sessionUser = await requireActionSessionUser();

    if (normalizeEdmsRole(sessionUser.role) !== "admin") {
      throw new Error("Only administrators can assign project members.");
    }

    const [existingMembership] = await db
      .select({
        id: projectMembers.id,
      })
      .from(projectMembers)
      .where(
        and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, input.userId))
      )
      .limit(1);

    const now = new Date();

    if (existingMembership) {
      await db
        .update(projectMembers)
        .set({
          role: input.role,
          assignedAt: now,
          assignedBy: sessionUser.id,
        })
        .where(eq(projectMembers.id, existingMembership.id));
    } else {
      await db.insert(projectMembers).values({
        id: createEdmsId("project-member"),
        projectId: input.projectId,
        userId: input.userId,
        role: input.role,
        assignedAt: now,
        assignedBy: sessionUser.id,
      });
    }

    if (input.role === "client") {
      await db
        .update(projects)
        .set({
          clientId: input.userId,
          updatedAt: now,
        })
        .where(eq(projects.id, input.projectId));
    }

    const [projectSummary] = await db
      .select({
        name: projects.name,
      })
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: existingMembership ? "project_member_updated" : "project_member_assigned",
      entityType: "project_member",
      entityId: existingMembership?.id ?? input.userId,
      entityName: projectSummary?.name ?? "Project member",
      description: `${input.role} assignment saved for the project workspace.`,
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${input.projectId}`);

    return actionOk({
      created: !existingMembership,
    });
  } catch (error) {
    return actionFromError(error, "Unable to save the project assignment.");
  }
}
