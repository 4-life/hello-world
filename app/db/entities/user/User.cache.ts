import { getApolloCache } from '@/server/cache';
import type { User } from '@/app/db/entities';

const USER_TTL = 300;
const userKey = (id: string): string => `user:${id}`;

export async function getCachedUser(id: string): Promise<User | null> {
  const cached = await getApolloCache().get(userKey(id));
  return cached ? (JSON.parse(cached) as User) : null;
}

export async function setCachedUser(user: User): Promise<void> {
  await getApolloCache().set(userKey(user.id), JSON.stringify(user), {
    ttl: USER_TTL,
  });
}

export async function invalidateUserCache(id: string): Promise<void> {
  await getApolloCache().delete(userKey(id));
}
