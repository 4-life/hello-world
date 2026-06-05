import { redis } from './redis';

class RedisCache {
  async get(key: string): Promise<string | undefined> {
    const val = await redis.get(key);
    return val ?? undefined;
  }

  async set(
    key: string,
    value: string,
    options?: { ttl?: number | null },
  ): Promise<void> {
    if (options?.ttl) {
      await redis.setex(key, options.ttl, value);
    } else {
      await redis.set(key, value);
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await redis.del(key);
    return result > 0;
  }
}

let cache: RedisCache | null = null;

export function getApolloCache(): RedisCache {
  if (!cache) cache = new RedisCache();
  return cache;
}
