import { NextResponse } from "next/server";
import { getGlobalSearchData } from "@/lib/edms/search";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export async function GET(request: Request) {
  try {
    const sessionUser = await getRequiredDashboardSessionUser();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const data = await getGlobalSearchData(sessionUser, query);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to perform search", results: [] }, { status: 500 });
  }
}
