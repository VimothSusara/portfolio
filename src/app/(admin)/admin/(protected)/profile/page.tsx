import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update your public profile, bio, links, and images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile editor</CardTitle>
          <CardDescription>
            Images upload via presigned URLs to Supabase Storage. Changes appear on the public site after save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}