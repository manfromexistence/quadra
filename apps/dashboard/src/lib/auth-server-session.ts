import { auth } from "@/lib/auth";

export async function getRequestAuthSession() {
  try {
    const nextHeaders = await import("next/headers");

    return await auth.api.getSession({
      headers: await nextHeaders.headers(),
    });
  } catch {
    return await auth.api.getSession();
  }
}
