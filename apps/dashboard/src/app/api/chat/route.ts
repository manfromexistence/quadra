import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { userProjectAccess } from "@/db/schema/access";
import { auth } from "@/lib/auth";

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

    // Fetch user's EDMS projects to provide context to the AI
    let projectsContext = "No active projects found for this user.";
    try {
      const userProjects = await db
        .select({
          name: projects.name,
          number: projects.projectNumber,
          description: projects.description,
          status: projects.status,
        })
        .from(projects)
        .innerJoin(userProjectAccess, eq(projects.id, userProjectAccess.projectId))
        .where(eq(userProjectAccess.userId, session.user.id));

      if (userProjects.length > 0) {
        projectsContext = userProjects
          .map((p) => `- ${p.number || "No number"}: ${p.name} (${p.status}) - ${p.description || "No description"}`)
          .join("\n");
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
- Understanding their business data and metrics
- Analyzing transactions and financial information
- Managing documents and projects
- Answering questions about their dashboard and projects

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
