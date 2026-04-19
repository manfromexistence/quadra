"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent } from "@midday/ui/card";
import { Checkbox } from "@midday/ui/checkbox";
import { cn } from "@midday/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@midday/ui/dropdown-menu";
import { Input } from "@midday/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@midday/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Loader2,
  MoreHorizontal,
  Search,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  bulkDeleteUsers,
  bulkToggleUserStatus,
  bulkUpdateUserRoles,
} from "@/actions/admin-users";
import { toast } from "@/hooks/use-toast";
import {
  type AdminEditableUser,
  AdminUserEditSheet,
} from "./admin-user-edit-sheet";
import { EdmsStatusBadge, formatEdmsLabel } from "./status-badge";

const PAGE_SIZE = 50;
const editableRoles = [
  "admin",
  "client",
  "pmc",
  "vendor",
  "subcontractor",
  "user",
] as const;

type SortKey = "name" | "email" | "role" | "organization" | "status";
type SortDirection = "asc" | "desc";

interface AdminUsersTableProps {
  users: AdminEditableUser[];
  currentAdminId: string;
}

export function AdminUsersTable({
  users,
  currentAdminId,
}: AdminUsersTableProps) {
  const [query, setQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = normalizedQuery.length
      ? users.filter((user) =>
          [
            user.name,
            user.email,
            user.role ?? "",
            user.organization ?? "",
            user.jobTitle ?? "",
            user.department ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : users;

    return [...result].sort((left, right) =>
      compareUsers(left, right, sortKey, sortDirection),
    );
  }, [query, sortDirection, sortKey, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const currentPageUsers = filteredUsers.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );
  const allVisibleSelected =
    currentPageUsers.length > 0 &&
    currentPageUsers.every((user) => selectedUserIds.includes(user.id));

  const selectedCount = selectedUserIds.length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const toggleVisibleRows = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds((current) => {
        const next = new Set(current);

        for (const user of currentPageUsers) {
          next.add(user.id);
        }

        return [...next];
      });
      return;
    }

    setSelectedUserIds((current) =>
      current.filter(
        (userId) => !currentPageUsers.some((user) => user.id === userId),
      ),
    );
  };

  const toggleSelection = (userId: string, checked: boolean) => {
    setSelectedUserIds((current) =>
      checked
        ? [...new Set([...current, userId])]
        : current.filter((item) => item !== userId),
    );
  };

  const runBulkRoleUpdate = (role: (typeof editableRoles)[number]) => {
    startTransition(async () => {
      const result = await bulkUpdateUserRoles(
        selectedUserIds.map((userId) => ({
          userId,
          role,
        })),
      );

      if (!result.success) {
        toast({
          title: "Bulk role update failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Roles updated",
        description: `${result.data} users were moved to ${formatEdmsLabel(role)}.`,
      });

      setSelectedUserIds([]);
      window.location.reload();
    });
  };

  const runBulkStatusUpdate = (isActive: boolean) => {
    startTransition(async () => {
      const result = await bulkToggleUserStatus({
        userIds: selectedUserIds,
        isActive,
      });

      if (!result.success) {
        toast({
          title: "Bulk status update failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isActive ? "Users activated" : "Users deactivated",
        description: `${result.data} users were updated.`,
      });

      setSelectedUserIds([]);
      window.location.reload();
    });
  };

  const runBulkDelete = () => {
    startTransition(async () => {
      const result = await bulkDeleteUsers(selectedUserIds);

      if (!result.success) {
        toast({
          title: "Bulk delete failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Users deleted",
        description: `${result.data} users were removed from the workspace.`,
      });

      setSelectedUserIds([]);
      window.location.reload();
    });
  };

  const exportCsv = () => {
    const rows = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Role: formatEdmsLabel(user.role ?? "user"),
      Organization: user.organization ?? "",
      "Job Title": user.jobTitle ?? "",
      Department: user.department ?? "",
      Phone: user.phone ?? "",
      Status: (user.isActive ?? true) ? "Active" : "Inactive",
    }));

    const headers = Object.keys(
      rows[0] ?? {
        Name: "",
        Email: "",
        Role: "",
        Organization: "",
        "Job Title": "",
        Department: "",
        Phone: "",
        Status: "",
      },
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map(
            (header) =>
              `"${String(row[header as keyof typeof row] ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const href = URL.createObjectURL(blob);
    link.href = href;
    link.download = "quadra-users.csv";
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="space-y-4 px-0 py-0">
        <div className="flex flex-col gap-3 border-b px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, role, organization, or department"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={exportCsv}>
                <Download className="size-4" />
                Export CSV
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={selectedCount === 0 || isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Applying
                      </>
                    ) : (
                      <>
                        <MoreHorizontal className="size-4" />
                        Bulk actions
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {selectedCount} user{selectedCount === 1 ? "" : "s"}{" "}
                    selected
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {editableRoles.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => runBulkRoleUpdate(role)}
                        >
                          {formatEdmsLabel(role)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => runBulkStatusUpdate(true)}>
                    Activate selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => runBulkStatusUpdate(false)}>
                    Deactivate selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={runBulkDelete}
                  >
                    Delete selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users2 className="size-4" />
              {filteredUsers.length} matching users
            </div>
            {selectedCount > 0 ? (
              <span>{selectedCount} selected for bulk actions</span>
            ) : null}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={(checked) =>
                    toggleVisibleRows(Boolean(checked))
                  }
                  aria-label="Select visible users"
                />
              </TableHead>
              <SortableHead
                label="Name"
                isActive={sortKey === "name"}
                direction={sortDirection}
                onClick={() => toggleSort("name")}
              />
              <SortableHead
                label="Email"
                isActive={sortKey === "email"}
                direction={sortDirection}
                onClick={() => toggleSort("email")}
              />
              <SortableHead
                label="Role"
                isActive={sortKey === "role"}
                direction={sortDirection}
                onClick={() => toggleSort("role")}
              />
              <SortableHead
                label="Organization"
                isActive={sortKey === "organization"}
                direction={sortDirection}
                onClick={() => toggleSort("organization")}
              />
              <SortableHead
                label="Status"
                isActive={sortKey === "status"}
                direction={sortDirection}
                onClick={() => toggleSort("status")}
              />
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-16 text-center text-muted-foreground"
                >
                  No users matched the current search.
                </TableCell>
              </TableRow>
            ) : (
              currentPageUsers.map((user) => (
                <TableRow
                  key={user.id}
                  data-state={
                    selectedUserIds.includes(user.id) ? "selected" : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) =>
                        toggleSelection(user.id, Boolean(checked))
                      }
                      aria-label={`Select ${user.name}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-44">
                    <div className="space-y-1 whitespace-normal">
                      <Link
                        href={`/dashboard/admin/users/${user.id}`}
                        className="font-medium transition-colors hover:text-primary"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {user.jobTitle || "No title"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>{formatEdmsLabel(user.role ?? "user")}</TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {user.organization || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <EdmsStatusBadge
                      status={(user.isActive ?? true) ? "active" : "archived"}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminUserEditSheet
                      user={user}
                      currentAdminId={currentAdminId}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <div className="border-t px-4 py-4 md:px-6">
            <Pagination className="justify-between">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.max(1, page - 1));
                    }}
                    className={cn(
                      safePage === 1 && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
              <PaginationContent>
                {buildVisiblePages(totalPages, safePage).map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={safePage === pageNumber}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              <PaginationContent>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                    }}
                    className={cn(
                      safePage === totalPages &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SortableHead({
  label,
  isActive,
  direction,
  onClick,
}: {
  label: string;
  isActive: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{label}</span>
        {isActive ? (
          direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5" />
        )}
      </button>
    </TableHead>
  );
}

function compareUsers(
  left: AdminEditableUser,
  right: AdminEditableUser,
  key: SortKey,
  direction: SortDirection,
) {
  const multiplier = direction === "asc" ? 1 : -1;

  const leftValue =
    key === "status"
      ? Boolean(left.isActive ?? true).toString()
      : key === "organization"
        ? (left.organization ?? "")
        : key === "role"
          ? (left.role ?? "")
          : left[key];

  const rightValue =
    key === "status"
      ? Boolean(right.isActive ?? true).toString()
      : key === "organization"
        ? (right.organization ?? "")
        : key === "role"
          ? (right.role ?? "")
          : right[key];

  return (
    String(leftValue ?? "").localeCompare(String(rightValue ?? "")) * multiplier
  );
}

function buildVisiblePages(totalPages: number, currentPage: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const normalizedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - normalizedStart + 1 },
    (_, index) => normalizedStart + index,
  );
}
