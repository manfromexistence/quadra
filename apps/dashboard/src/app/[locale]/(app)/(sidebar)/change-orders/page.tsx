import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import type { Metadata } from "next";
import Link from "next/link";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getChangeOrders } from "@/lib/edms/change-orders";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Change Orders | Quadra EDMS",
};

export default async function ChangeOrdersPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Change Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const changeOrders = await getChangeOrders(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Change Orders
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Track contract variations, cost impacts, and approval workflows.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/change-orders/new">+ New Change Order</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Change Order Register</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {changeOrders.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No change orders found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">CO #</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Original Value</TableHead>
                    <TableHead>Change Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeOrders.map((co) => (
                    <TableRow
                      key={co.id}
                      className="group transition-colors hover:bg-accent"
                    >
                      <TableCell className="px-6">
                        <div className="font-mono text-xs font-medium">
                          {co.changeOrderNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{co.reason}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {co.originalContractValue
                          ? `$${(Number(co.originalContractValue) / 100).toLocaleString()}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        ${Number(co.changeValue / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <EdmsStatusBadge status={co.approvalStatus} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(co.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/change-orders/${co.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
