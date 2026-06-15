type CredentialImage = {
  publicUrl: string;
} | null;

type CredentialLike = {
  iconUrl: string | null;
  image: CredentialImage;
};

export function getCredentialImageUrl(credential: CredentialLike) {
  return credential.image?.publicUrl ?? credential.iconUrl ?? null;
}

export function formatCredentialDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
