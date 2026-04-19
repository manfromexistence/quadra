"use client";

import { cn } from "@midday/ui/cn";
import { Icons } from "@midday/ui/icons";
import {
  Activity,
  BookOpen,
  Calendar,
  ClipboardList,
  Cog,
  FileStack,
  FolderKanban,
  Grid3X3,
  HelpCircle,
  Mail,
  MailOpen,
  MessageSquare,
  Palette,
  Send,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const icons = {
  "/": () => <Icons.Overview size={20} />,
  "/reports": () => <Icons.Monitoring size={20} />,
  "/transactions": () => <Icons.Transactions size={20} />,
  "/invoices": () => <Icons.Invoice size={20} />,
  "/tracker": () => <Icons.Tracker size={20} />,
  "/customers": () => <Icons.Customers size={20} />,
  "/vault": () => <Icons.Vault size={20} />,
  "/settings": () => <Cog size={20} />,
  "/apps": () => <Icons.Apps size={20} />,
  "/inbox": () => <Icons.Inbox2 size={20} />,
  "/projects": () => <FolderKanban size={20} />,
  "/documents": () => <FileStack size={20} />,
  "/workflows": () => <Workflow size={20} />,
  "/transmittals": () => <Send size={20} />,
  "/incoming-transmittals": () => <MailOpen size={20} />,
  "/technical-queries": () => <HelpCircle size={20} />,
  "/site-tech-queries": () => <Wrench size={20} />,
  "/rfis": () => <MessageSquare size={20} />,
  "/letters": () => <Mail size={20} />,
  "/memos": () => <MessageSquare size={20} />,
  "/meetings": () => <Users size={20} />,
  "/notifications": () => <Activity size={20} />,
  "/schedule": () => <Calendar size={20} />,
  "/databook": () => <BookOpen size={20} />,
  "/matrix": () => <Grid3X3 size={20} />,
  "/audit": () => <ClipboardList size={20} />,
  "/bulk-upload": () => <Icons.Upload size={20} />,
  "/theme": () => <Palette size={20} />,
} as const;

const items = [
  {
    path: "/",
    name: "Overview",
  },
  {
    path: "/projects",
    name: "Projects",
  },
  {
    path: "/documents",
    name: "Documents",
  },
  {
    path: "/workflows",
    name: "Workflows",
  },
  {
    path: "/transmittals",
    name: "Transmittals",
    children: [
      {
        path: "/transmittals",
        name: "Outgoing",
      },
      {
        path: "/incoming-transmittals",
        name: "Incoming",
      },
      {
        path: "/transmittals/new",
        name: "New Transmittal",
      },
    ],
  },
  {
    path: "/technical-queries",
    name: "Queries & RFIs",
    children: [
      {
        path: "/technical-queries",
        name: "Technical Queries",
      },
      {
        path: "/site-tech-queries",
        name: "Site Tech Queries",
      },
      {
        path: "/rfis",
        name: "RFIs",
      },
    ],
  },
  {
    path: "/letters",
    name: "Correspondence",
    children: [
      {
        path: "/letters",
        name: "Letters Register",
      },
      {
        path: "/letters/new",
        name: "New Letter",
      },
      {
        path: "/memos",
        name: "Memos",
      },
    ],
  },
  {
    path: "/meetings",
    name: "Meetings",
    children: [
      {
        path: "/meetings",
        name: "Minutes of Meeting",
      },
      {
        path: "/meetings/new",
        name: "New MoM",
      },
    ],
  },
  {
    path: "/notifications",
    name: "Activities",
  },
  {
    path: "/reports",
    name: "Reports",
  },
  {
    path: "/schedule",
    name: "Schedule",
  },
  {
    path: "/databook",
    name: "Data Book",
  },
  {
    path: "/matrix",
    name: "Matrix",
  },
  {
    path: "/audit",
    name: "Audit",
  },
  {
    path: "/bulk-upload",
    name: "Bulk Upload",
  },
  {
    path: "/theme",
    name: "Theme",
  },
  {
    path: "/vault",
    name: "Vault",
  },
  {
    path: "/transactions",
    name: "Transactions",
    children: [
      {
        path: "/transactions/categories",
        name: "Categories",
      },
      {
        path: "/transactions?step=connect",
        name: "Connect bank",
      },
      {
        path: "/transactions?step=import&hide=true",
        name: "Import",
      },
      { path: "/transactions?createTransaction=true", name: "Create new" },
    ],
  },
  {
    path: "/inbox",
    name: "Inbox",
    children: [{ path: "/inbox/settings", name: "Settings" }],
  },
  {
    path: "/invoices",
    name: "Invoices",
    children: [
      { path: "/invoices/products", name: "Products" },
      { path: "/invoices?invoiceType=create", name: "Create new" },
    ],
  },
  {
    path: "/tracker",
    name: "Tracker",
    children: [{ path: "/tracker?create=true", name: "Create new" }],
  },
  {
    path: "/customers",
    name: "Customers",
    children: [{ path: "/customers?createCustomer=true", name: "Create new" }],
  },
  {
    path: "/apps",
    name: "Apps",
    children: [
      { path: "/apps", name: "All" },
      { path: "/apps?tab=installed", name: "Installed" },
    ],
  },
  {
    path: "/settings",
    name: "Settings",
    children: [
      { path: "/settings", name: "General" },
      { path: "/settings/billing", name: "Billing" },
      { path: "/settings/accounts", name: "Bank Connections" },
      { path: "/settings/members", name: "Members" },
      { path: "/settings/notifications", name: "Notifications" },
      { path: "/settings/developer", name: "Developer" },
    ],
  },
];

interface ItemProps {
  item: {
    path: string;
    name: string;
    children?: { path: string; name: string }[];
  };
  isActive: boolean;
  isExpanded: boolean;
  isItemExpanded: boolean;
  onToggle: (path: string) => void;
  onSelect?: () => void;
}

const ChildItem = ({
  child,
  isActive,
  isExpanded,
  shouldShow,
  onSelect,
  index,
}: {
  child: { path: string; name: string };
  isActive: boolean;
  isExpanded: boolean;
  shouldShow: boolean;
  onSelect?: () => void;
  index: number;
}) => {
  const showChild = isExpanded && shouldShow;

  return (
    <Link
      href={child.path}
      prefetch
      onClick={() => onSelect?.()}
      className="block group/child"
    >
      <div className="relative">
        {/* Child item text */}
        <div
          className={cn(
            "ml-[35px] mr-[15px] h-[32px] flex items-center",
            "border-l border-[#e6e6e6] dark:border-[#1d1d1d] pl-3",
            "transition-all duration-200 ease-out",
            showChild
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2",
          )}
          style={{
            transitionDelay: showChild
              ? `${40 + index * 20}ms`
              : `${index * 20}ms`,
          }}
        >
          <span
            className={cn(
              "text-xs font-medium transition-colors duration-200",
              "text-[#888] group-hover/child:text-primary",
              "whitespace-nowrap overflow-hidden",
              isActive && "text-primary",
            )}
          >
            {child.name}
          </span>
        </div>
      </div>
    </Link>
  );
};

const Item = ({
  item,
  isActive,
  isExpanded,
  isItemExpanded,
  onToggle,
  onSelect,
}: ItemProps) => {
  const Icon = icons[item.path as keyof typeof icons];
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  // Children should be visible when: expanded sidebar AND this item is expanded
  const shouldShowChildren = isExpanded && isItemExpanded;

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(item.path);
  };

  return (
    <div className="group">
      <Link
        href={item.path}
        prefetch
        onClick={() => onSelect?.()}
        className="group"
      >
        <div className="relative">
          {/* Background that expands */}
          <div
            className={cn(
              "border border-transparent h-[40px] transition-all duration-200 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb; ml-[15px] mr-[15px]",
              isActive &&
                "bg-[#f7f7f7] dark:bg-[#131313] border-[#e6e6e6] dark:border-[#1d1d1d]",
              isExpanded ? "w-[calc(100%-30px)]" : "w-[40px]",
            )}
          />

          {/* Icon - always in same position from sidebar edge */}
          <div className="absolute top-0 left-[15px] w-[40px] h-[40px] flex items-center justify-center dark:text-[#666666] text-black group-hover:!text-primary pointer-events-none">
            <div className={cn(isActive && "dark:!text-white")}>
              <Icon />
            </div>
          </div>

          {isExpanded && (
            <div className="absolute top-0 left-[55px] right-[4px] h-[40px] flex items-center pointer-events-none">
              <span
                className={cn(
                  "text-sm font-medium transition-opacity duration-200 ease-in-out text-[#666] group-hover:text-primary",
                  "whitespace-nowrap overflow-hidden",
                  hasChildren ? "pr-2" : "",
                  isActive && "text-primary",
                )}
              >
                {item.name}
              </span>
              {hasChildren && (
                <button
                  type="button"
                  onClick={handleChevronClick}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center transition-all duration-200 ml-auto mr-3",
                    "text-[#888] hover:text-primary pointer-events-auto",
                    isActive && "text-primary/60",
                    shouldShowChildren && "rotate-180",
                  )}
                >
                  <Icons.ChevronDown size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Children */}
      {hasChildren && (
        <div
          className={cn(
            "transition-all duration-300 ease-out overflow-hidden",
            shouldShowChildren ? "max-h-96 mt-1" : "max-h-0",
          )}
        >
          {item.children!.map((child, index) => {
            const isChildActive = pathname === child.path;
            return (
              <ChildItem
                key={child.path}
                child={child}
                isActive={isChildActive}
                isExpanded={isExpanded}
                shouldShow={shouldShowChildren}
                onSelect={onSelect}
                index={index}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

type Props = {
  onSelect?: () => void;
  isExpanded?: boolean;
};

export function MainMenu({ onSelect, isExpanded = false }: Props) {
  const pathname = usePathname();
  // Strip locale prefix (e.g. /en/documents -> /documents)
  // next-international with urlMappingStrategy:"rewrite" can expose /en/... to usePathname()
  const normalizedPath = pathname
    ? pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") || "/"
    : "/";
  const part = normalizedPath.split("/")[1];
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Reset expanded item when sidebar expands/collapses
  useEffect(() => {
    setExpandedItem(null);
  }, [isExpanded]);

  return (
    <div className="mt-4 w-full">
      <nav className="w-full">
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isActive =
              (normalizedPath === "/" && item.path === "/") ||
              (normalizedPath !== "/" &&
                item.path !== "/" &&
                `/${part}` === item.path);

            return (
              <Item
                key={item.path}
                item={item}
                isActive={isActive}
                isExpanded={isExpanded}
                isItemExpanded={expandedItem === item.path}
                onToggle={(path) => {
                  setExpandedItem(expandedItem === path ? null : path);
                }}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}
