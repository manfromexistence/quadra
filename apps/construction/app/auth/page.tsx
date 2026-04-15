"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const mode =
    searchParams?.get("mode") === "signup"
      ? "signup"
      : searchParams?.get("mode") === "forgot"
        ? "forgot"
        : "signin";

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (session?.user) {
      router.push("/dashboard");
    }
  }, [isPending, router, session]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      {isPending ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading your session...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <AuthPanel initialMode={mode} variant="page" />
        </div>
      )}
    </div>
  );
}
