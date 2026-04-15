import { NextResponse } from "next/server";
import { getDocumentControlData } from "@/lib/edms/documents";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUser = await getRequiredDashboardSessionUser();

    const filters = {
      query: searchParams.get("query") || undefined,
      status: searchParams.get("status") || undefined,
      discipline: searchParams.get("discipline") || undefined,
      revision: searchParams.get("revision") || undefined,
    };

    const data = await getDocumentControlData(sessionUser, filters);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json({ error: "Failed to fetch documents data" }, { status: 500 });
  }
}
