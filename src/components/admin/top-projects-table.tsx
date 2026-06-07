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

type TopProjectsTableProps = {
  projects: Array<{
    projectId: string;
    title: string;
    slug: string;
    views: number;
  }>;
};

export function TopProjectsTable({ projects }: TopProjectsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top projects</CardTitle>
        <CardDescription>Project detail page views</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No project views recorded yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="hover:underline"
                      target="_blank"
                    >
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {project.views}
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
