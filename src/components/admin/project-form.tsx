"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ProjectGalleryField } from "@/components/admin/project-gallery-field";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/validations/project";
import type { z } from "zod";
import type { Technology } from "@/generated/prisma/client";

type ProjectFormProps = {
  mode: "create" | "edit";
  projectId?: string;
  technologies: Technology[];
  githubRepositories?: Array<{
    id: string;
    ownerName: string;
    repoName: string;
    stars: number;
    forks: number;
  }>;
  defaultValues?: Partial<ProjectFormValues>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ProjectForm({
  mode,
  projectId,
  technologies,
  githubRepositories = [],
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const form = useForm<
    z.input<typeof projectFormSchema>,
    unknown,
    ProjectFormValues
  >({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      githubUrl: "",
      liveUrl: "",
      githubRepositoryId: undefined,
      featured: false,
      status: "DRAFT",
      lifecycle: "PLANNING",
      type: "OTHER",
      sortOrder: 0,
      technologyIds: [],
      thumbnail: null,
      gallery: [],
      ...defaultValues,
    },
  });

  const {
    control,
    register,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form;

  const title = watch("title");
  const selectedTechIds = watch("technologyIds");
  const thumbnail = watch("thumbnail");
  const gallery = watch("gallery");

  useEffect(() => {
    if (!slugTouched && title) {
      setValue("slug", slugify(title, { lower: true, strict: true }), {
        shouldDirty: true,
      });
    }
  }, [title, slugTouched, setValue]);

  function toggleTechnology(technologyId: string) {
    const current = getValues("technologyIds");
    const next = current.includes(technologyId)
      ? current.filter((id) => id !== technologyId)
      : [...current, technologyId];

    setValue("technologyIds", next, { shouldDirty: true });
  }

  async function onSubmit(values: ProjectFormValues) {
    setIsSaving(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${projectId}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save project");
      }

      toast.success(mode === "create" ? "Project created" : "Project updated");

      if (mode === "create") {
        router.push("/admin/projects");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save project",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            aria-invalid={!!errors.slug}
            {...register("slug")}
            onChange={(e) => {
              setSlugTouched(true);
              setValue("slug", e.target.value, { shouldDirty: true });
            }}
          />
          <FieldError message={errors.slug?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.status?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lifecycle">Lifecycle</Label>
          <Controller
            name="lifecycle"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="lifecycle" className="w-full">
                  <SelectValue placeholder="Select lifecycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.lifecycle?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="APPLICATION">Application</SelectItem>
                  <SelectItem value="GAME">Game</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            aria-invalid={!!errors.sortOrder}
            {...register("sortOrder", { valueAsNumber: true })}
          />
          <FieldError message={errors.sortOrder?.message} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            rows={3}
            aria-invalid={!!errors.shortDescription}
            {...register("shortDescription")}
          />
          <FieldError message={errors.shortDescription?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Full description</Label>
          <Textarea
            id="description"
            rows={10}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            aria-invalid={!!errors.githubUrl}
            {...register("githubUrl")}
          />
          <FieldError message={errors.githubUrl?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input
            id="liveUrl"
            aria-invalid={!!errors.liveUrl}
            {...register("liveUrl")}
          />
          <FieldError message={errors.liveUrl?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="githubRepositoryId">Linked GitHub repository</Label>
          <Controller
            name="githubRepositoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
              >
                <SelectTrigger id="githubRepositoryId" className="w-full">
                  <SelectValue placeholder="Select a synced repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {githubRepositories.map((repository) => (
                    <SelectItem key={repository.id} value={repository.id}>
                      {repository.ownerName}/{repository.repoName} ·{" "}
                      {repository.stars.toLocaleString()} stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Run a GitHub sync first to populate repositories. Linking shows live
            repo stats on project cards.
          </p>
          <FieldError message={errors.githubRepositoryId?.message} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ImageUploadField
          label="Thumbnail"
          folder="projects"
          value={thumbnail?.publicUrl ?? ""}
          onChange={(url) => {
            if (!url) {
              setValue("thumbnail", null, { shouldDirty: true });
              return;
            }
            setValue("thumbnail", { publicUrl: url }, { shouldDirty: true });
          }}
          onUploadComplete={(media) =>
            setValue("thumbnail", media, { shouldDirty: true })
          }
        />

        <div className="md:col-span-2">
          <ProjectGalleryField
            value={gallery ?? []}
            onChange={(items) => setValue("gallery", items, { shouldDirty: true })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <Label>Technologies</Label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech) => (
            <label
              key={tech.id}
              htmlFor={`tech-${tech.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                id={`tech-${tech.id}`}
                checked={selectedTechIds.includes(tech.id)}
                onCheckedChange={() => toggleTechnology(tech.id)}
              />
              <span>{tech.name}</span>
            </label>
          ))}
        </div>
      </section>

      <Controller
        name="featured"
        control={control}
        render={({ field }) => (
          <label
            htmlFor="featured"
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              id="featured"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            Featured project
          </label>
        )}
      />

      <Button type="submit" disabled={isSaving}>
        {isSaving
          ? "Saving..."
          : mode === "create"
            ? "Create project"
            : "Save changes"}
      </Button>
    </form>
  );
}
