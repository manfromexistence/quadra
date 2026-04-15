"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { projectMembers, projects } from "@/db/schema/projects";
import { requireEdmsRole } from "@/lib/edms/rbac";
import { logError } from "@/lib/shared";
import { prepareDatabaseUrls } from "@/lib/storage-utils";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const projectStatuses = ["active", "on-hold", "completed", "archived"] as const;
const projectMemberRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters.")
      .max(255, "Project name is too long."),
    projectNumber: z.string().trim().max(100, "Project number is too long.").optional(),
    location: z.string().trim().max(255, "Location is too long.").optional(),
    description: z.string().trim().max(2000, "Description is too long.").optional(),
    status: z.enum(projectStatuses),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    images: z.array(z.string().url()).optional(),
  })
  .refine(
    (value) => {
      if (!value.startDate || !value.endDate) {
        return true;
      }

      return new Date(value.endDate) >= new Date(value.startDate);
    },
    {
      message: "End date must be on or after the start date.",
      path: ["endDate"],
    }
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

const assignProjectMemberSchema = z.object({
  projectId: z.string().uuid("Project selection is required."),
  userId: z.string().trim().min(1, "User selection is required."),
  role: z.enum(projectMemberRoles),
});

export type AssignProjectMemberInput = z.infer<typeof assignProjectMemberSchema>;

export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validation = createProjectSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid project data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("pmc");
    const values = validation.data;
    const now = new Date();

    // Optimize URLs for database storage
    const optimizedData = prepareDatabaseUrls({
      images: values.images,
    });

    const [createdProject] = await db
      .insert(projects)
      .values({
        name: values.name,
        description: normalizeOptionalString(values.description),
        projectNumber: normalizeOptionalString(values.projectNumber),
        location: normalizeOptionalString(values.location),
        status: values.status,
        startDate: parseOptionalDate(values.startDate),
        endDate: parseOptionalDate(values.endDate),
        images: optimizedData.images || null,
        createdBy: access.id,
        updatedAt: now,
      })
      .returning({ id: projects.id });

    await db.insert(projectMembers).values({
      projectId: createdProject.id,
      userId: access.id,
      role: "admin",
      assignedBy: access.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${createdProject.id}`);

    return actionSuccess({ id: createdProject.id });
  } catch (error) {
    logError(error as Error, { action: "createProject", input });

    if (error instanceof Error && error.message.includes("does not exist")) {
      return actionError(
        ErrorCode.UNKNOWN_ERROR,
        "Project tables are not available yet. Run the EDMS migrations before creating projects."
      );
    }

    if (error instanceof Error && error.message.includes("Insufficient permissions")) {
      return actionError(
        ErrorCode.UNAUTHORIZED,
        "Only PMC, client, and admin roles can create projects."
      );
    }

    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to create project. Please try again.");
  }
}

export async function assignProjectMember(
  input: AssignProjectMemberInput
): Promise<ActionResult<{ id: string; created: boolean }>> {
  try {
    const validation = assignProjectMemberSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid project member data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("pmc");
    const values = validation.data;

    const existingRows = await db
      .select({ id: projectMembers.id })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, values.projectId),
          eq(projectMembers.userId, values.userId)
        )
      )
      .limit(1);

    const [existingMember] = existingRows;

    if (existingMember) {
      await db
        .update(projectMembers)
        .set({
          role: values.role,
          assignedBy: access.id,
        })
        .where(eq(projectMembers.id, existingMember.id));

      revalidateProjectPaths(values.projectId);
      return actionSuccess({ id: existingMember.id, created: false });
    }

    const [createdMember] = await db
      .insert(projectMembers)
      .values({
        projectId: values.projectId,
        userId: values.userId,
        role: values.role,
        assignedBy: access.id,
      })
      .returning({ id: projectMembers.id });

    revalidateProjectPaths(values.projectId);
    return actionSuccess({ id: createdMember.id, created: true });
  } catch (error) {
    logError(error as Error, { action: "assignProjectMember", input });

    if (error instanceof Error && error.message.includes("does not exist")) {
      return actionError(
        ErrorCode.UNKNOWN_ERROR,
        "Project member tables are not available yet. Run the EDMS migrations before assigning users."
      );
    }

    if (error instanceof Error && error.message.includes("Insufficient permissions")) {
      return actionError(
        ErrorCode.UNAUTHORIZED,
        "Only PMC, client, and admin roles can manage project assignments."
      );
    }

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      "Failed to update the project team. Please try again."
    );
  }
}

function revalidateProjectPaths(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

function normalizeOptionalString(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value);
}
