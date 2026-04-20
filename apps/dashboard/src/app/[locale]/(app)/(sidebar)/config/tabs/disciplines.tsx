import { Button } from "@midday/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";

const DISCIPLINES = [
  { code: "ARC", name: "Architecture", color: "#3b82f6", docCount: 142 },
  { code: "STR", name: "Structural", color: "#ef4444", docCount: 89 },
  { code: "MEC", name: "Mechanical", color: "#10b981", docCount: 156 },
  { code: "ELE", name: "Electrical", color: "#f59e0b", docCount: 134 },
  { code: "PLU", name: "Plumbing", color: "#06b6d4", docCount: 67 },
  { code: "FPS", name: "Fire Protection", color: "#dc2626", docCount: 45 },
  { code: "LAN", name: "Landscape", color: "#22c55e", docCount: 23 },
  { code: "INT", name: "Interior Design", color: "#a855f7", docCount: 38 },
];

export function ConfigDisciplines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Disciplines</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Engineering and design disciplines used in document classification
          </p>
        </div>
        <Button size="sm">+ Add Discipline</Button>
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DISCIPLINES.map((discipline) => (
              <TableRow key={discipline.code}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: discipline.color }}
                    />
                    <span className="font-mono text-sm font-medium">
                      {discipline.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{discipline.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {discipline.docCount} docs
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
