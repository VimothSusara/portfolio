const ICON_ALIASES: Record<string, string> = {
  nextjs: "nextdotjs",
  nodejs: "nodedotjs",
  tailwind: "tailwindcss",
  postgres: "postgresql",
  aws: "amazonwebservices",
};

export function normalizeTechnologyIconSlug(iconName?: string | null) {
  if (!iconName?.trim()) return null;

  const normalized = iconName.trim().toLowerCase();
  return ICON_ALIASES[normalized] ?? normalized;
}

export function getSimpleIconCdnUrl(iconName?: string | null) {
  const slug = normalizeTechnologyIconSlug(iconName);
  if (!slug) return null;
  return `https://cdn.simpleicons.org/${slug}`;
}

export type TechnologyIconSource = {
  name: string;
  iconName?: string | null;
  iconUrl?: string | null;
};

export function getTechnologyIconSrc(technology: TechnologyIconSource) {
  if (technology.iconUrl?.trim()) {
    return technology.iconUrl.trim();
  }

  return getSimpleIconCdnUrl(technology.iconName);
}
