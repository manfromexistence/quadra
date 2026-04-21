import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Quadra EDMS",
};

export default function Dashboard() {
  // Redirect to projects page to make it the default
  redirect("/projects");
}
