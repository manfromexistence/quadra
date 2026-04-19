import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { canManageEdmsContent, normalizeEdmsRole } from "@/lib/edms/rbac";
import type { DashboardSessionUser } from "@/lib/edms/session";
import { ForbiddenError, UnauthorizedError } from "@/types/errors";

export type EdmsActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string } };

export function actionOk<T>(data: T): EdmsActionResult<T> {
  return { success: true, data };
}

export function actionError(message: string): EdmsActionResult<never> {
  return {
    success: false,
    error: { message },
  };
}

export function actionFromError(
  error: unknown,
  fallbackMessage: string,
): EdmsActionResult<never> {
  if (error instanceof Error && error.message.trim().length > 0) {
    return actionError(error.message);
  }

  return actionError(fallbackMessage);
}

export async function requireActionSessionUser(): Promise<DashboardSessionUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      role: userTable.role,
      organization: userTable.organization,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError();
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? "https://github.com/shadcn.png",
    role: user.role ?? "user",
    organization: user.organization,
  };
}

export function requireManageEdmsContent(role: string | null | undefined) {
  const normalizedRole = normalizeEdmsRole(role);

  if (!canManageEdmsContent(normalizedRole)) {
    throw new ForbiddenError(
      "You do not have permission to manage EDMS content.",
    );
  }
}

export function createEdmsId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function parseOptionalDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeOptionalString(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseStringArray(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
  } catch {
    return [];
  }
}

export function toStringArrayJson(values: Array<string | null | undefined>) {
  return JSON.stringify(
    Array.from(
      new Set(
        values.filter((value): value is string => Boolean(value?.trim())),
      ),
    ),
  );
}

export function parseTagList(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  );
}

export function mapDecisionToApprovalCode(
  decision:
    | "approve"
    | "approve_with_comments"
    | "reject"
    | "comment"
    | "for_information",
) {
  switch (decision) {
    case "approve":
      return 1;
    case "approve_with_comments":
      return 2;
    case "reject":
      return 3;
    case "for_information":
      return 4;
    default:
      return 5;
  }
}
