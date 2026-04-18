import { NextResponse } from "next/server";
import { ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const searchPattern = `%${q}%`;

    const [foundProjects, foundDocuments] = await Promise.all([
      db.select({
        id: projects.id,
        name: projects.name,
        number: projects.projectNumber,
      })
      .from(projects)
      .where(or(ilike(projects.name, searchPattern), ilike(projects.projectNumber, searchPattern)))
      .limit(5),
      
      db.select({
        id: documents.id,
        title: documents.title,
        number: documents.documentNumber,
        discipline: documents.discipline,
      })
      .from(documents)
      .where(or(ilike(documents.title, searchPattern), ilike(documents.documentNumber, searchPattern)))
      .limit(5)
    ]);

    const results = [
      ...foundProjects.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.number || "No project number",
        category: "project",
        href: `/projects/${p.id}`,
        meta: "Project",
      })),
      ...foundDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: d.number,
        category: "document",
        href: `/documents/${d.id}`,
        meta: d.discipline || "General",
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
