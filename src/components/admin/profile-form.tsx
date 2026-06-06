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

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load profile");
        }

        if (data.profile) {
          form.reset({
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
  }, [form]);

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...form.register("fullName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register("title")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...form.register("location")} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shortBio">Short bio</Label>
          <Textarea id="shortBio" rows={3} {...form.register("shortBio")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longBio">Long bio</Label>
          <Textarea id="longBio" rows={8} {...form.register("longBio")} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ImageUploadField
          label="Avatar"
          value={form.watch("avatarUrl")}
          onChange={(url) =>
            form.setValue("avatarUrl", url, { shouldDirty: true })
          }
        />

        <ImageUploadField
          label="Hero background"
          value={form.watch("heroImageUrl")}
          onChange={(url) =>
            form.setValue("heroImageUrl", url, { shouldDirty: true })
          }
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ResumeUploadField
          value={form.watch("resumeUrl")}
          onChange={(url) =>
            form.setValue("resumeUrl", url, { shouldDirty: true })
          }
        />
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" {...form.register("websiteUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input id="githubUrl" {...form.register("githubUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input id="linkedinUrl" {...form.register("linkedinUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterUrl">Twitter / X</Label>
          <Input id="twitterUrl" {...form.register("twitterUrl")} />
        </div>
      </section>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
