import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import type { CredentialsConfig } from 'next-auth/providers/credentials';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ensureDb, truncateAll, createUser } from '../helpers/db';
import { resetSignInRateLimit } from '@/server/rateLimiter';

const TEST_IP = 'test-auth-rl';

const credentialsProvider = authOptions.providers.find(
  (p): p is CredentialsConfig => (p as CredentialsConfig).type === 'credentials',
) as CredentialsConfig;

// NextAuth stores the real authorize at .options.authorize — the top-level one is always () => null
const authorize = (credentialsProvider as unknown as { options: CredentialsConfig }).options
  .authorize;

function makeReq(ip: string) {
  return { headers: { 'x-forwarded-for': ip }, body: {}, query: {}, method: 'POST' };
}

describe('credentials sign-in', () => {
  beforeAll(async () => {
    await ensureDb();
  });

  beforeEach(async () => {
    await truncateAll();
    await resetSignInRateLimit(TEST_IP);
    await resetSignInRateLimit('unknown');
  });

  it('returns user on correct credentials', async () => {
    await createUser({ email: 'me@test.com' });
    const result = await authorize({ login: 'me@test.com', password: 'password' }, makeReq(TEST_IP));
    expect(result).not.toBeNull();
    expect(result?.email).toBe('me@test.com');
  });

  it('returns null on wrong password', async () => {
    await createUser({ email: 'me@test.com' });
    const result = await authorize({ login: 'me@test.com', password: 'wrong' }, makeReq(TEST_IP));
    expect(result).toBeNull();
  });

  it('returns null for unknown login', async () => {
    const result = await authorize({ login: 'nobody@test.com', password: 'secret' }, makeReq(TEST_IP));
    expect(result).toBeNull();
  });

  it('blocks the 6th attempt from the same IP', async () => {
    for (let i = 0; i < 5; i++) {
      await authorize({ login: `u${i}@test.com`, password: 'any' }, makeReq(TEST_IP));
    }
    await expect(
      authorize({ login: 'blocked@test.com', password: 'any' }, makeReq(TEST_IP)),
    ).rejects.toThrow(/too many sign-in attempts/i);
  });
});
