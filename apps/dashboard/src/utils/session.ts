import { getSession } from "@/lib/auth-client";

export async function getAccessToken(): Promise<string | null> {
  const result = await getSession();

  return result.data?.session?.token ?? result.data?.session?.id ?? null;
}
