import { Icons } from "@midday/ui/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginVideoBackground } from "@/components/login-video-background";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Login | Quadra EDMS",
};

export default async function Page() {
  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Logo - Fixed position matching website header exactly */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none">
        <div className="relative py-3 xl:py-4 px-4 sm:px-4 md:px-4 lg:px-4 xl:px-6 2xl:px-8 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 active:opacity-80 transition-opacity duration-200 pointer-events-auto"
          >
            <div className="w-6 h-6">
              <Icons.LogoSmall className="w-full h-full text-foreground lg:text-white" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Left Side - Video Background */}
      <LoginVideoBackground />

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 pb-2">
        <div className="w-full max-w-md flex flex-col h-full">
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {/* Header */}
            {/* <div className="text-center space-y-2">
              <h1 className="text-lg lg:text-xl mb-4 font-serif">
                Welcome to Quadra EDMS
              </h1>
              <p className="font-sans text-sm text-[#878787]">
                Sign in or create an account
              </p>
            </div> */}

            {/* Auth Panel with Better Auth */}
            <AuthPanel initialMode="signin" variant="dialog" />
          </div>

          {/* Terms and Privacy Policy - Bottom aligned */}
          <div className="text-center mt-auto">
            <p className="font-sans text-xs text-[#878787]">
              By signing in you agree to use QUADRA EDMS for your construction project management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
