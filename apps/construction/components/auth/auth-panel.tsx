"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Github from "@/assets/github.svg";
import Google from "@/assets/google.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PostLoginActionType } from "@/hooks/use-post-login-action";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthPanelProps {
  initialMode?: AuthMode;
  postLoginActionType?: PostLoginActionType | null;
  onSuccess?: () => void;
  variant?: "page" | "dialog";
}

function getContextualCopy(actionType?: PostLoginActionType | null) {
  switch (actionType) {
    case "SAVE_THEME":
      return {
        title: "Sign in to Save",
        description: "Sign in to save your theme and access it from anywhere.",
      };
    case "SAVE_THEME_FOR_SHARE":
      return {
        title: "Sign in to Share",
        description: "Sign in to save and share your theme with others.",
      };
    case "SAVE_THEME_FOR_V0":
      return {
        title: "Sign in to open in v0",
        description: "Sign in to save your theme and open it in v0.",
      };
    case "AI_GENERATE_FROM_PAGE":
    case "AI_GENERATE_FROM_CHAT":
    case "AI_GENERATE_FROM_CHAT_SUGGESTION":
    case "AI_GENERATE_EDIT":
    case "AI_GENERATE_RETRY":
      return {
        title: "Sign in for AI",
        description: "Sign in to use AI-powered theme generation.",
      };
    case "CHECKOUT":
      return {
        title: "Sign in to continue",
        description: "Sign in to complete your purchase.",
      };
    default:
      return null;
  }
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  if ("error" in error && typeof error.error === "object" && error.error !== null) {
    const nestedError = error.error as { message?: unknown };

    if (typeof nestedError.message === "string" && nestedError.message.length > 0) {
      return nestedError.message;
    }
  }

  if ("message" in error && typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}

function getModeCopy(
  mode: AuthMode,
  contextualCopy?: { title: string; description: string } | null
) {
  if (mode === "forgot") {
    return {
      title: "Reset password",
      description: "Enter your account email and we will send you a reset link.",
    };
  }

  if (contextualCopy && mode === "signin") {
    return contextualCopy;
  }

  return mode === "signin"
    ? {
        title: "Welcome back",
        description: "Sign in to your account to continue.",
      }
    : {
        title: "Create account",
        description: "Create your account and complete your EDMS onboarding.",
      };
}

export function AuthPanel({
  initialMode = "signin",
  postLoginActionType,
  onSuccess,
  variant = "page",
}: AuthPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const isSignIn = mode === "signin";
  const contextualCopy = getContextualCopy(postLoginActionType);
  const copy = getModeCopy(mode, contextualCopy);

  useEffect(() => {
    setMode(initialMode);
    setEmail("");
    setPassword("");
    setName("");
  }, [initialMode]);

  const getCallbackUrl = (targetMode: "signin" | "signup" | "social" = "signin") => {
    const baseUrl =
      targetMode === "signup"
        ? "/settings/account?onboarding=1"
        : pathname && pathname.length > 0 && pathname !== "/auth"
          ? pathname
          : "/dashboard";
    const queryString = searchParams?.toString() || "";

    if (!queryString || targetMode === "signup") {
      return baseUrl;
    }

    return `${baseUrl}?${queryString}`;
  };

  const getResetRedirectUrl = () => {
    if (typeof window === "undefined") {
      return ["/auth", "reset-password"].join("/");
    }

    return `${window.location.origin}${["/auth", "reset-password"].join("/")}`;
  };

  const completeAuthTransition = (nextUrl: string) => {
    onSuccess?.();
    router.push(nextUrl);
    router.refresh();
  };

  const _handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: getCallbackUrl("social"),
      });

      if (result?.error) {
        throw result;
      }
    } catch (error) {
      setIsGoogleLoading(false);
      toast({
        title: "Google sign-in failed",
        description: getAuthErrorMessage(
          error,
          "Google sign-in is not available right now. Check the OAuth configuration."
        ),
        variant: "destructive",
      });
    }
  };

  const _handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: getCallbackUrl("social"),
      });

      if (result?.error) {
        throw result;
      }
    } catch (error) {
      setIsGithubLoading(false);
      toast({
        title: "GitHub sign-in failed",
        description: getAuthErrorMessage(
          error,
          "GitHub sign-in is not available right now. Check the OAuth configuration."
        ),
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Enter the email address for the account you want to recover.",
        variant: "destructive",
      });
      return;
    }

    setIsEmailLoading(true);

    try {
      // @ts-ignore - forgetPassword exists but types may not be updated
      const result = await authClient.forgetPassword({
        email,
        redirectTo: getResetRedirectUrl(),
      });

      if ("error" in result && result.error) {
        throw result;
      }

      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      });
      setMode("signin");
    } catch (error) {
      toast({
        title: "Reset request failed",
        description: getAuthErrorMessage(
          error,
          "Unable to send the reset email. Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "forgot") {
      await handleForgotPassword(event);
      return;
    }

    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Enter your email address and password.",
        variant: "destructive",
      });
      return;
    }

    if (!isSignIn && !name.trim()) {
      toast({
        title: "Name required",
        description: "Enter your full name before creating the account.",
        variant: "destructive",
      });
      return;
    }

    setIsEmailLoading(true);

    try {
      if (isSignIn) {
        const callbackURL = getCallbackUrl("signin");
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL,
        });

        if ("error" in result && result.error) {
          throw result;
        }

        toast({
          title: "Signed in",
          description: "Your session is ready.",
        });
        completeAuthTransition(callbackURL);
        return;
      }

      const callbackURL = getCallbackUrl("signup");
      const result = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
        callbackURL,
      });

      if ("error" in result && result.error) {
        throw result;
      }

      toast({
        title: "Account created",
        description: "Continue to complete your EDMS profile.",
      });
      completeAuthTransition(callbackURL);
    } catch (error) {
      toast({
        title: isSignIn ? "Sign-in failed" : "Sign-up failed",
        description: getAuthErrorMessage(
          error,
          `Unable to ${isSignIn ? "sign in" : "create the account"}. Please try again.`
        ),
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const cardClassName =
    variant === "dialog" ? "border-0 bg-transparent shadow-none" : "border-border/70 shadow-sm";

  return (
    <Card className={cardClassName}>
      <CardHeader className={variant === "dialog" ? "space-y-2 px-6 pt-2" : "space-y-2"}>
        <CardTitle className="text-center text-2xl font-semibold">{copy.title}</CardTitle>
        <CardDescription className="text-center">{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className={variant === "dialog" ? "space-y-6 px-6 pb-6" : "space-y-6"}>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isSignIn && mode !== "forgot" ? (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Full name</Label>
              <Input
                id="auth-name"
                type="text"
                placeholder="Ahsan Khan"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isEmailLoading}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isEmailLoading}
              required
            />
          </div>

          {mode !== "forgot" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="auth-password">Password</Label>
                {isSignIn ? (
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </button>
                ) : null}
              </div>
              <Input
                id="auth-password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isEmailLoading}
                minLength={8}
                required
              />
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isEmailLoading || isGoogleLoading || isGithubLoading}
          >
            {isEmailLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "forgot" ? "Send reset link" : isSignIn ? "Sign in" : "Create account"}
          </Button>
        </form>

        {/* OAuth buttons temporarily disabled */}
        {/* {mode !== "forgot" ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-2"
                disabled={isGoogleLoading || isGithubLoading || isEmailLoading}
                type="button"
              >
                <Google className="size-5" />
                <span>Continue with Google</span>
                {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleGithubSignIn}
                className="flex w-full items-center justify-center gap-2"
                disabled={isGoogleLoading || isGithubLoading || isEmailLoading}
                type="button"
              >
                <Github className="size-5" />
                <span>Continue with GitHub</span>
                {isGithubLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              </Button>
            </div>
          </>
        ) : null} */}

        <div className="border-t pt-6 text-center text-sm">
          {mode === "forgot" ? (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode("signin")}
            >
              Back to sign in
            </button>
          ) : (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode(isSignIn ? "signup" : "signin")}
            >
              {isSignIn ? "Create an account" : "Sign in to your account"}
            </button>
          )}
        </div>

        {variant === "page" ? (
          <p className="text-center text-xs leading-6 text-muted-foreground">
            By continuing, you agree to use QUADRA for your project collaboration and
            document-control workflow. Theme Studio remains available in{" "}
            <Link href="/editor/theme" className="text-primary hover:underline">
              the editor
            </Link>
            .
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
