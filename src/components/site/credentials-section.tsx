"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import {
  formatCredentialDate,
  getCredentialImageUrl,
} from "@/lib/credentials/display";
import type { getPublishedCredentials } from "@/lib/queries/credentials";

type Credential = Awaited<ReturnType<typeof getPublishedCredentials>>[number];

function CredentialCard({ credential }: { credential: Credential }) {
  const imageUrl = getCredentialImageUrl(credential);
  const issuedLabel = formatCredentialDate(credential.issuedAt);
  const expiresLabel = formatCredentialDate(credential.expiresAt);

  const content = (
    <div className="flex h-full flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-4">
        {imageUrl ? (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
            <Image
              src={imageUrl}
              alt={credential.title}
              fill
              className="object-contain p-2"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-xs font-medium text-muted-foreground">
            {credential.type === "CERTIFICATION" ? "CERT" : "BADGE"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">{credential.title}</h3>
          {credential.issuer && (
            <p className="mt-1 text-sm text-muted-foreground">{credential.issuer}</p>
          )}
        </div>
      </div>

      {credential.description && (
        <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
          {credential.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-xs text-muted-foreground">
        {issuedLabel && <span>Issued {issuedLabel}</span>}
        {expiresLabel && <span>Expires {expiresLabel}</span>}
        {credential.credentialUrl && (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <ExternalLink className="size-3" />
            Verify
          </span>
        )}
      </div>
    </div>
  );

  if (credential.credentialUrl) {
    return (
      <Link
        href={credential.credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function CredentialSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Credential[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <FadeIn>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </FadeIn>

      <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((credential) => (
          <StaggerItem key={credential.id} className="h-full">
            <CredentialCard credential={credential} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

export function CredentialsSection({ credentials }: { credentials: Credential[] }) {
  const certifications = credentials.filter((item) => item.type === "CERTIFICATION");
  const badges = credentials.filter(
    (item) => item.type === "BADGE" || item.type === "AWARD",
  );

  if (certifications.length === 0 && badges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16">
      <CredentialSection
        title="Certifications"
        description="Professional certifications and credentials."
        items={certifications}
      />

      <CredentialSection
        title="Badges & awards"
        description="Platform badges, achievements, and recognitions."
        items={badges}
      />
    </div>
  );
}
