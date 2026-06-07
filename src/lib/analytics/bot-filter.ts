export function isLikelyBot(userAgent: string | null | undefined) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return /bot|crawler|spider|crawling|preview|slurp|facebookexternalhit|whatsapp|telegram/i.test(
    ua,
  );
}
