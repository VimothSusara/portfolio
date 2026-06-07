import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TopPagesTableProps = {
  pages: Array<{ path: string; views: number }>;
};

export function TopPagesTable({ pages }: TopPagesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top pages</CardTitle>
        <CardDescription>
          Most viewed routes in the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No page views recorded yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.path}>
                  <TableCell>
                    {page.path.startsWith("/projects/") ? (
                      <Link
                        href={page.path}
                        className="hover:underline"
                        target="_blank"
                      >
                        {page.path}
                      </Link>
                    ) : (
                      page.path
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {page.views}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
