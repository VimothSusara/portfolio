import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Project not found</h1>
      <p className="mt-2 text-muted-foreground">This project does not exist or is not published.</p>
      <Button asChild className="mt-6">
        <Link href="/projects">Back to projects</Link>
      </Button>
    </section>
  );
}