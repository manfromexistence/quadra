"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export type OAuthProvider = "google" | "github";

type ProviderConfig = {
  name: string;
  icon: "Google" | "Github";
  variant: "primary" | "secondary";
};

const OAUTH_PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    name: "Google",
    icon: "Google",
    variant: "secondary",
  },
  github: {
    name: "Github",
    icon: "Github",
    variant: "secondary",
  },
};

export function useOAuthSignIn(provider: OAuthProvider) {
  const [isLoading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to");
  const config = OAUTH_PROVIDERS[provider];

  const handleSignIn = async () => {
    setLoading(true);

    try {
      const callbackURL = returnTo || "/";

      await signIn.social({
        provider,
        callbackURL,
      });
    } catch (error) {
      console.error("OAuth sign in error:", error);
      setLoading(false);
    }
  };

  return { handleSignIn, isLoading, config };
}
