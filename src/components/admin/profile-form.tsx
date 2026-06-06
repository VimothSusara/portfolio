"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/validations/profile";
import { ResumeUploadField } from "@/components/admin/resume-upload-field";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      title: "",
      shortBio: "",
      longBio: "",
      email: "",
      location: "",
      resumeUrl: "",
      avatarUrl: "",
      heroImageUrl: "",
      githubUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      websiteUrl: "",
    },
  });

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load profile");
        }

        if (data.profile) {
          reset({
            fullName: data.profile.fullName ?? "",
            title: data.profile.title ?? "",
            shortBio: data.profile.shortBio ?? "",
            longBio: data.profile.longBio ?? "",
            email: data.profile.email ?? "",
            location: data.profile.location ?? "",
            resumeUrl: data.profile.resumeUrl ?? "",
            avatarUrl: data.profile.avatarUrl ?? "",
            heroImageUrl: data.profile.heroImageUrl ?? "",
            githubUrl: data.profile.githubUrl ?? "",
            linkedinUrl: data.profile.linkedinUrl ?? "",
            twitterUrl: data.profile.twitterUrl ?? "",
            websiteUrl: data.profile.websiteUrl ?? "",
          });
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load profile",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [reset]);

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save profile");
      }

      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile...</p>;
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
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" aria-invalid={!!errors.fullName} {...register("fullName")} />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" aria-invalid={!!errors.location} {...register("location")} />
          <FieldError message={errors.location?.message} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shortBio">Short bio</Label>
          <Textarea id="shortBio" rows={3} aria-invalid={!!errors.shortBio} {...register("shortBio")} />
          <FieldError message={errors.shortBio?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longBio">Long bio</Label>
          <Textarea id="longBio" rows={8} aria-invalid={!!errors.longBio} {...register("longBio")} />
          <FieldError message={errors.longBio?.message} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <ImageUploadField
            label="Avatar"
            value={watch("avatarUrl")}
            onChange={(url) => setValue("avatarUrl", url, { shouldDirty: true, shouldValidate: true })}
          />
          <FieldError message={errors.avatarUrl?.message} />
        </div>

        <div className="space-y-2">
          <ImageUploadField
            label="Hero background"
            value={watch("heroImageUrl")}
            onChange={(url) =>
              setValue("heroImageUrl", url, { shouldDirty: true, shouldValidate: true })
            }
          />
          <FieldError message={errors.heroImageUrl?.message} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <ResumeUploadField
            value={watch("resumeUrl")}
            onChange={(url) => setValue("resumeUrl", url, { shouldDirty: true, shouldValidate: true })}
          />
          <FieldError message={errors.resumeUrl?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" aria-invalid={!!errors.websiteUrl} {...register("websiteUrl")} />
          <FieldError message={errors.websiteUrl?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input id="githubUrl" aria-invalid={!!errors.githubUrl} {...register("githubUrl")} />
          <FieldError message={errors.githubUrl?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input id="linkedinUrl" aria-invalid={!!errors.linkedinUrl} {...register("linkedinUrl")} />
          <FieldError message={errors.linkedinUrl?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterUrl">Twitter / X</Label>
          <Input id="twitterUrl" aria-invalid={!!errors.twitterUrl} {...register("twitterUrl")} />
          <FieldError message={errors.twitterUrl?.message} />
        </div>
      </section>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
