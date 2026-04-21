import { headers } from "next/headers";

export async function isDesktopApp() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent");
    return userAgent?.includes("Midday Desktop App");
  } catch {
    return false;
  }
}
