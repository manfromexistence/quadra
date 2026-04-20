import { Button } from "@midday/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";

const DOC_TYPES = [
  { code: "DWG", name: "Drawing", docCount: 342 },
  { code: "SPE", name: "Specification", docCount: 89 },
  { code: "REP", name: "Report", docCount: 156 },
  { code: "CAL", name: "Calculation", docCount: 134 },
  { code: "SCH", name: "Schedule", docCount: 67 },
  { code: "MAN", name: "Manual", docCount: 45 },
  { code: "CER", name: "Certificate", docCount: 23 },
  { code: "COR", name: "Correspondence", docCount: 198 },
];

export function ConfigDocTypes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Document Types</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Categories of documents used in the project
          </p>
        </div>
        <Button size="sm">+ Add Type</Button>
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
            {DOC_TYPES.map((docType) => (
              <TableRow key={docType.code}>
                <TableCell>
                  <span className="font-mono text-sm font-medium">
                    {docType.code}
                  </span>
                </TableCell>
                <TableCell>{docType.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {docType.docCount} docs
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
