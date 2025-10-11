import { kv } from "@vercel/kv";

const CACHE_TTL = 30 * 60; // 30 minutes in seconds

export async function getCachedData<T>(userId: string): Promise<T | null> {
    try {
        const cached = await kv.get(`classroom:${userId}`);
        return cached as T | null;
    } catch (error) {
        console.warn("Vercel KV get error:", error);
        return null;
    }
}

export async function setCacheData<T>(userId: string, data: T): Promise<void> {
    try {
        await kv.setex(`classroom:${userId}`, CACHE_TTL, JSON.stringify(data));
    } catch (error) {
        console.warn("Vercel KV set error:", error);
        // Cache failure shouldn't break the app
    }
}

export async function clearUserCache(userId: string): Promise<void> {
    try {
        await kv.del(`classroom:${userId}`);
    } catch (error) {
        console.warn("Vercel KV delete error:", error);
    }
}
