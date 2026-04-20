import { Button } from "@midday/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";

const STAKEHOLDERS = [
  {
    id: "CLI-001",
    name: "Client Project Management",
    role: "Client",
    contact: "pm@client.com",
  },
  {
    id: "PMC-001",
    name: "Project Management Consultant",
    role: "PMC",
    contact: "lead@pmc.com",
  },
  {
    id: "CON-001",
    name: "Main Contractor",
    role: "Contractor",
    contact: "pm@contractor.com",
  },
  {
    id: "DES-001",
    name: "Design Consultant",
    role: "Designer",
    contact: "lead@designer.com",
  },
  {
    id: "SUB-001",
    name: "MEP Subcontractor",
    role: "Subcontractor",
    contact: "coord@mep-sub.com",
  },
  {
    id: "AUT-001",
    name: "Local Authority",
    role: "Authority",
    contact: "approvals@authority.gov",
  },
];

export function ConfigStakeholders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Stakeholders</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Organizations and parties involved in the project
          </p>
        </div>
        <Button size="sm">+ Add Stakeholder</Button>
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STAKEHOLDERS.map((stakeholder) => (
              <TableRow key={stakeholder.id}>
                <TableCell>
                  <span className="font-mono text-sm">{stakeholder.id}</span>
                </TableCell>
                <TableCell>{stakeholder.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium border border-border bg-muted">
                    {stakeholder.role.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {stakeholder.contact}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
