import { Skeleton } from "@midday/ui/skeleton";
import { Suspense } from "react";
import { NotificationCenter } from "@/components/notification-center";
import { OpenSearchButton } from "@/components/search/open-search-button";
import { UserMenu } from "@/components/user-menu";
import { MobileMenu } from "./mobile-menu";

function UserMenuSkeleton() {
  return <Skeleton className="w-8 h-8 rounded-full" />;
}

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-[70px] md:m-0 z-50 px-6 md:border-b h-[70px] flex justify-between items-center backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60 desktop:rounded-t-[10px]">
      <MobileMenu />

      <OpenSearchButton />

      <div className="flex space-x-2 ml-auto">
        {/* <ConnectionStatus /> */}
        <NotificationCenter />
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
