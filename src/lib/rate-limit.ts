import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const contactRatelimit =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "portfolio:contact",
      })
    : null;

export async function rateLimitContact(ip: string): Promise<RateLimitResult> {
  if (!contactRatelimit) {
    return { success: true, limit: 3, remaining: 3, reset: Date.now() };
  }

  const result = await contactRatelimit.limit(ip);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
