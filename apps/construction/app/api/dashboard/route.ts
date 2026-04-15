import { NextResponse } from "next/server";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getRequiredDashboardSessionUser();
    const data = await getEdmsDashboardData(sessionUser);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
