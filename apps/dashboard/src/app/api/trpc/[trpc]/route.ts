import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { appRouter } from "./router";
import { createContext } from "./context";

const handler = (req: NextRequest) => {
  console.log(`[tRPC API] ${req.method} ${req.url}`);
  
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError: ({ path, error }) => {
      console.error(`❌ tRPC ERROR on ${path ?? "<no-path>"}:`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Cause:`, error.cause);
      if (error.cause instanceof Error) {
        console.error(`   Cause Message: ${error.cause.message}`);
        console.error(`   Cause Stack:`, error.cause.stack);
      }
      console.error(`   Full Error:`, JSON.stringify(error, null, 2));
    },
  });
};

export { handler as GET, handler as POST };
