"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog";
import { TechnologyIcon } from "@/components/site/technology-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POPULAR_TECH_ICONS } from "@/data/popular-tech-icons";
import { uploadAndRegisterMedia } from "@/lib/media/client-upload";
import {
  technologyFormSchema,
  type TechnologyFormValues,
} from "@/validations/technology";

type TechnologyFormProps = {
  mode: "create" | "edit";
  technologyId?: string;
  defaultValues?: Partial<TechnologyFormValues>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function TechnologyForm({
  mode,
  technologyId,
  defaultValues,
}: TechnologyFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const iconUploadRef = useRef<HTMLInputElement>(null);

  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(technologyFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      iconName: "",
      iconUrl: "",
      websiteUrl: "",
      ...defaultValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const name = watch("name");
  const iconName = watch("iconName");
  const iconUrl = watch("iconUrl");

  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name, { lower: true, strict: true }), {
        shouldDirty: true,
      });
    }
  }, [name, slugTouched, setValue]);

  async function handleIconUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Icon must be under 5MB");
      return;
    }

    setIsUploadingIcon(true);

    try {
      const media = await uploadAndRegisterMedia({ file, folder: "profile" });
      setValue("iconUrl", media.publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Custom icon uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploadingIcon(false);
      if (iconUploadRef.current) iconUploadRef.current.value = "";
    }
  }

  async function onSubmit(values: TechnologyFormValues) {
    setIsSaving(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/technologies"
          : `/api/admin/technologies/${technologyId}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save technology");
      }

      toast.success(mode === "create" ? "Technology created" : "Technology updated");

      if (mode === "create") {
        router.push("/admin/technologies");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save technology",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        toast.error("Please fix the highlighted fields before saving.");
      })}
      className="space-y-8"
    >
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            aria-invalid={!!errors.slug}
            {...register("slug")}
            onChange={(event) => {
              setSlugTouched(true);
              setValue("slug", event.target.value, { shouldDirty: true });
            }}
          />
          <FieldError message={errors.slug?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="Framework, Language, Database..."
            aria-invalid={!!errors.category}
            {...register("category")}
          />
          <FieldError message={errors.category?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            aria-invalid={!!errors.websiteUrl}
            {...register("websiteUrl")}
          />
          <FieldError message={errors.websiteUrl?.message} />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-medium">Icon</h3>
          <p className="text-sm text-muted-foreground">
            Pick a popular Simple Icons slug, type any slug from{" "}
            <a
              href="https://simpleicons.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              simpleicons.org
            </a>
            , or upload a custom image that overrides the slug.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <TechnologyIcon
            technology={{ name: name || "Tech", iconName, iconUrl }}
            size={32}
          />
          <div className="text-sm text-muted-foreground">Preview</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="iconName">Icon slug (Simple Icons)</Label>
            <Input
              id="iconName"
              placeholder="e.g. nextdotjs, supabase, django..."
              aria-invalid={!!errors.iconName}
              {...register("iconName")}
            />
            <p className="text-xs text-muted-foreground">
              Type any slug from{" "}
              <a
                href="https://simpleicons.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                simpleicons.org
              </a>
              . It does not need to appear in the quick pick list below.
            </p>
            <FieldError message={errors.iconName?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="iconNamePopular">Quick pick (optional)</Label>
            <Select
              value={
                POPULAR_TECH_ICONS.some((icon) => icon.slug === iconName)
                  ? iconName
                  : "none"
              }
              onValueChange={(value) => {
                if (value !== "none") {
                  setValue("iconName", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="iconNamePopular" className="w-full">
                <SelectValue placeholder="Choose a popular icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None selected</SelectItem>
                {POPULAR_TECH_ICONS.map((icon) => (
                  <SelectItem key={icon.slug} value={icon.slug}>
                    {icon.label} ({icon.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="iconUrl">Custom icon image (overrides slug)</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingIcon}
              onClick={() => iconUploadRef.current?.click()}
            >
              {isUploadingIcon ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload image
            </Button>
            <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
              Choose from library
            </Button>
            {iconUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setValue("iconUrl", "", { shouldDirty: true })}
              >
                Clear
              </Button>
            )}
          </div>
          <Input
            id="iconUrl"
            placeholder="Or paste an image URL"
            aria-invalid={!!errors.iconUrl}
            {...register("iconUrl")}
          />
          <FieldError message={errors.iconUrl?.message} />
          <input
            ref={iconUploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleIconUpload}
          />
        </div>
      </section>

      <Button type="submit" disabled={isSaving}>
        {isSaving
          ? "Saving..."
          : mode === "create"
            ? "Create technology"
            : "Save changes"}
      </Button>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mimePrefix="image/"
        title="Choose custom icon"
        description="Uploads from your media library override the Simple Icons slug."
        onSelect={(media) => {
          setValue("iconUrl", media.publicUrl, {
            shouldDirty: true,
            shouldValidate: true,
          });
          toast.success("Custom icon selected");
        }}
      />
    </form>
  );
}
