import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
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

    console.log('Transformed messages:', JSON.stringify(transformedMessages, null, 2));

    // Use streamText and return the proper streaming response
    const result = streamText({
      model,
      messages: transformedMessages,
      system: `You are a helpful AI assistant for Quadra EDMS, a document management and business intelligence platform.
      
Current context:
- User timezone: ${timezone || "UTC"}
- Local time: ${localTime || new Date().toISOString()}

You help users with:
- Understanding their business data and metrics
- Analyzing transactions and financial information
- Managing documents and projects
- Answering questions about their dashboard

Be concise, helpful, and professional in your responses.`,
    });

    console.log('StreamText result created, using manual streaming...');

    // Manual streaming with proper AI SDK format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';
          for await (const chunk of result.textStream) {
            console.log('Streaming chunk:', chunk);
            fullText += chunk;
            // Send each chunk in the format the frontend expects
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          }
          console.log('Full text streamed:', fullText);
          // Send finish message
          controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    console.error("Error details:", error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
