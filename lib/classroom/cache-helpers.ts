import { Redis } from "@upstash/redis";

const CACHE_TTL = 30 * 60; // 30 minutes in seconds
const redis = Redis.fromEnv()
export async function getCachedData<T>(userId: string): Promise<T | null> {
  try {
    const cached = await redis.get(`classroom:${userId}`);
    return cached as T | null;
  } catch (error) {
    console.warn("Vercel KV get error:", error);
    return null;
  }
}

export async function setCacheData<T>(userId: string, data: T): Promise<void> {
  try {
    await redis.setex(`classroom:${userId}`, CACHE_TTL, JSON.stringify(data));
  } catch (error) {
    console.warn("Vercel KV set error:", error);
    // Cache failure shouldn't break the app
  }
}

export async function clearUserCache(userId: string): Promise<void> {
  try {
    await redis.del(`classroom:${userId}`);
  } catch (error) {
    console.warn("Vercel KV delete error:", error);
  }
}
