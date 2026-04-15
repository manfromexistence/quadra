"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@midday/ui/select";
import { Spinner } from "@midday/ui/spinner";
import { useToast } from "@midday/ui/use-toast";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthPanelProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  variant?: "page" | "dialog";
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

function getModeCopy(mode: AuthMode) {
  if (mode === "forgot") {
    return {
      title: "Reset password",
      description: "Enter your account email and we will send you a reset link.",
    };
  }

  return mode === "signin"
    ? {
        title: "Welcome back",
        description: "Sign in to your account to continue.",
      }
    : {
        title: "Create account",
        description: "Create your account and start managing your projects.",
      };
}

export function AuthPanel({
  initialMode = "signin",
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
  const [role, setRole] = useState<string>("user");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const isSignIn = mode === "signin";
  const copy = getModeCopy(mode);

  useEffect(() => {
    setMode(initialMode);
    setEmail("");
    setPassword("");
    setName("");
    setRole("user");
  }, [initialMode]);

  const getCallbackUrl = (targetMode: "signin" | "signup" | "social" = "signin") => {
    const baseUrl =
      targetMode === "signup"
        ? "/settings/account?onboarding=1"
        : pathname && pathname.length > 0 && pathname !== "/auth" && pathname !== "/login"
          ? pathname
          : "/";
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
        role,
        callbackURL,
      });

      if ("error" in result && result.error) {
        throw result;
      }

      toast({
        title: "Account created",
        description: "Continue to complete your profile.",
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
            <>
              <div className="space-y-2">
                <Label htmlFor="auth-name">Full name</Label>
                <Input
                  id="auth-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isEmailLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-role">Role</Label>
                <Select value={role} onValueChange={setRole} disabled={isEmailLoading}>
                  <SelectTrigger id="auth-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="pmc">PMC (Project Management Consultant)</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
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
            disabled={isEmailLoading}
          >
            {isEmailLoading ? <Spinner className="size-4" /> : null}
            {mode === "forgot" ? "Send reset link" : isSignIn ? "Sign in" : "Create account"}
          </Button>
        </form>

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
            By continuing, you agree to use QUADRA EDMS for your project management and document control.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
