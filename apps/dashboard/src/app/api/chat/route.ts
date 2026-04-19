import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { auth } from "@/lib/auth";
import { getProjectAccessScopeByUserId } from "@/lib/edms/access";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Using llama-3.1-8b-instant - Groq's fast and free model
const model = groq("llama-3.1-8b-instant");

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, timezone, localTime } = await req.json();

    // Transform messages to the correct format
    const transformedMessages = messages.map((msg: any) => {
      if (msg.parts && Array.isArray(msg.parts)) {
        // Extract text from parts structure
        const textContent = msg.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');
        
        return {
          role: msg.role,
          content: textContent
        };
      }
      
      // If already in correct format, return as is
      return {
        role: msg.role,
        content: msg.content || msg.text || ''
      };
    });

    // Fetch the user's accessible EDMS projects to provide context to the AI.
    let projectsContext = "No active projects found for this user.";
    try {
      const accessScope = await getProjectAccessScopeByUserId(session.user.id);
      const scopedProjectCondition = accessScope.isAdmin
        ? undefined
        : accessScope.projectIds.length > 0
          ? inArray(projects.id, accessScope.projectIds)
          : null;

      const userProjects =
        scopedProjectCondition === null
          ? []
          : await db
        .select({
          id: projects.id,
          name: projects.name,
          number: projects.projectNumber,
          description: projects.description,
          status: projects.status,
          startDate: projects.startDate,
          endDate: projects.endDate,
        })
        .from(projects)
        .where(scopedProjectCondition)
        .orderBy(desc(projects.updatedAt))
        .limit(8);

      if (userProjects.length > 0) {
        const projectIds = userProjects.map((project) => project.id);

        const [documentCounts, pendingWorkflowCounts, transmittalCounts, recentDocuments] =
          await Promise.all([
            db
              .select({
                projectId: documents.projectId,
                value: count(),
              })
              .from(documents)
              .where(inArray(documents.projectId, projectIds))
              .groupBy(documents.projectId),
            db
              .select({
                projectId: documents.projectId,
                value: count(),
              })
              .from(workflowSteps)
              .innerJoin(documentWorkflows, eq(workflowSteps.workflowId, documentWorkflows.id))
              .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
              .where(
                and(
                  inArray(documents.projectId, projectIds),
                  inArray(workflowSteps.status, ["pending", "in_progress"])
                )
              )
              .groupBy(documents.projectId),
            db
              .select({
                projectId: transmittals.projectId,
                value: count(),
              })
              .from(transmittals)
              .where(inArray(transmittals.projectId, projectIds))
              .groupBy(transmittals.projectId),
            db
              .select({
                projectId: documents.projectId,
                documentNumber: documents.documentNumber,
                title: documents.title,
                status: documents.status,
              })
              .from(documents)
              .where(inArray(documents.projectId, projectIds))
              .orderBy(desc(documents.uploadedAt))
              .limit(12),
          ]);

        const documentCountMap = new Map(
          documentCounts.map((row) => [String(row.projectId), Number(row.value ?? 0)])
        );
        const workflowCountMap = new Map(
          pendingWorkflowCounts.map((row) => [String(row.projectId), Number(row.value ?? 0)])
        );
        const transmittalCountMap = new Map(
          transmittalCounts.map((row) => [String(row.projectId), Number(row.value ?? 0)])
        );
        const recentDocumentsByProject = recentDocuments.reduce<Record<string, string[]>>(
          (acc, document) => {
            const key = String(document.projectId);
            if (!acc[key]) {
              acc[key] = [];
            }
            if (acc[key].length < 2) {
              acc[key].push(
                `${document.documentNumber}: ${document.title} (${document.status.replaceAll("_", " ")})`
              );
            }
            return acc;
          },
          {}
        );

        projectsContext = userProjects
          .map((project) => {
            const projectId = String(project.id);
            const recentProjectDocuments = recentDocumentsByProject[projectId] ?? [];

            return [
              `- Short title: ${project.number || project.name}`,
              `  Project: ${project.name}`,
              `  Status: ${project.status}`,
              `  Description: ${project.description || "No description provided."}`,
              `  Schedule: ${formatProjectDateRange(project.startDate, project.endDate)}`,
              `  Documents: ${documentCountMap.get(projectId) ?? 0}`,
              `  Workflow items: ${workflowCountMap.get(projectId) ?? 0}`,
              `  Transmittals: ${transmittalCountMap.get(projectId) ?? 0}`,
              `  Recent EDMS records: ${
                recentProjectDocuments.length > 0
                  ? recentProjectDocuments.join(" | ")
                  : "No recent document records."
              }`,
            ].join("\n");
          })
          .join("\n\n");
      }
    } catch (e) {
      console.error("Failed to fetch projects context", e);
    }

    // Use streamText with Groq
    const result = streamText({
      model,
      messages: transformedMessages,
      system: `You are a helpful AI assistant for Quadra EDMS, a document management and business intelligence platform.
      
Current context:
- User timezone: ${timezone || "UTC"}
- Local time: ${localTime || new Date().toISOString()}

User's EDMS Projects:
${projectsContext}

You help users with:
- Understanding their EDMS workspace and project portfolio
- Managing documents, workflows, transmittals, and notifications
- Answering questions using the user's actual project short title/code, project name, and description
- Summarizing the state of their accessible EDMS records before giving advice

If the user asks about a project, prioritize the exact EDMS context provided above. If the available context is insufficient, say what is missing instead of inventing details.

Be concise, helpful, and professional in your responses.`,
    });

    // Use toUIMessageStreamResponse() which is the correct method for useChat
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function formatProjectDateRange(startDate: Date | null, endDate: Date | null) {
  if (!startDate && !endDate) {
    return "Dates not scheduled";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (startDate && endDate) {
    return `${formatter.format(startDate)} to ${formatter.format(endDate)}`;
  }

  if (startDate) {
    return `Starts ${formatter.format(startDate)}`;
  }

  return `Ends ${formatter.format(endDate as Date)}`;
}
