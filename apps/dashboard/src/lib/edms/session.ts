import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { getRequestAuthSession } from "@/lib/auth-server-session";

export interface DashboardSessionUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  organization: string | null;
}

export async function getRequiredDashboardSessionUser(): Promise<DashboardSessionUser> {
  const session = await getRequestAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRows = await db
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

  const [user] = userRows;

  if (!user) {
    redirect("/login");
  }

  const role =
    typeof user.role === "string" && user.role.length > 0 ? user.role : "user";
  const organization =
    typeof user.organization === "string" && user.organization.length > 0
      ? user.organization
      : null;

  // Skip profile completion check for now - allow all authenticated users
  // if (isEdmsProfileIncomplete({ role, organization })) {
  //   redirect("/settings/account?onboarding=1");
  // }

  const userImage =
    typeof user.image === "string" && user.image.length > 0 ? user.image : "";

  return {
    id: user.id,
    name:
      typeof user.name === "string" && user.name.length > 0
        ? user.name
        : "Construction User",
    email: typeof user.email === "string" ? user.email : "",
    image: userImage,
    role,
    organization,
  };
}

function _isEdmsProfileIncomplete(profile: {
  role: string;
  organization: string | null;
}) {
  return profile.role === "user" || profile.organization === null;
}
