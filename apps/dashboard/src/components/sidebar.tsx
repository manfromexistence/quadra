"use client";

import { cn } from "@midday/ui/cn";
import { ScrollArea } from "@midday/ui/scroll-area";
import { Skeleton } from "@midday/ui/skeleton";
import Link from "next/link";
import { Suspense, useState } from "react";
import { BrandLogo } from "./brand-logo";
import { MainMenu } from "./main-menu";
import { TeamDropdown } from "./team-dropdown";

function TeamDropdownSkeleton({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="relative h-[32px]">
      <div className="fixed left-[19px] bottom-4 w-[32px] h-[32px]">
        <Skeleton className="w-[32px] h-[32px] rounded-none" />
      </div>
      {isExpanded && (
        <div className="fixed left-[62px] bottom-4 h-[32px] flex items-center">
          <Skeleton className="h-4 w-24" />
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Sidebar Body */}
      <aside
        className={cn(
          "h-screen flex-shrink-0 flex-col desktop:overflow-hidden desktop:rounded-bl-[10px] justify-between fixed top-0 pb-4 items-center hidden md:flex z-50 transition-all duration-200 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb;",
          "bg-background border-r border-border",
          isExpanded ? "w-[240px]" : "w-[70px]",
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <ScrollArea className="flex-1 w-full pt-[70px]">
          <div className="flex flex-col w-full pb-3 border-b border-border mb-3">
            <MainMenu isExpanded={isExpanded} />
          </div>
        </ScrollArea>

        <Suspense fallback={<TeamDropdownSkeleton isExpanded={isExpanded} />}>
          <TeamDropdown isExpanded={isExpanded} />
        </Suspense>
      </aside>

      {/* Fixed Sidebar Header - Must be after sidebar body to be on top */}
      <div
        className={cn(
          "fixed top-0 left-0 h-[70px] flex items-center bg-background border-b border-r border-border desktop:rounded-tl-[10px] z-[70] transition-all duration-200 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb; hidden md:flex",
          isExpanded ? "w-[240px]" : "w-[70px]",
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <Link href="/" className="flex items-center gap-3 pl-[22px]">
          <BrandLogo size={34} priority />
          {isExpanded && (
            <span className="text-xl font-semibold tracking-tight transition-opacity duration-200">
              Quadra
            </span>
          )}
        </Link>
      </div>
    </>
  );
}
