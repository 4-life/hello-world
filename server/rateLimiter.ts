import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { GraphQLError } from 'graphql';
import { redis } from './redis';

const POINTS = 5;
const DURATION = 60;

const signUpInsurance = new RateLimiterMemory({
  points: POINTS,
  duration: DURATION,
});
const signUpLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:signup',
  points: POINTS,
  duration: DURATION,
  insuranceLimiter: signUpInsurance,
});

const signInInsurance = new RateLimiterMemory({
  points: POINTS,
  duration: DURATION,
});
const signInLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:signin',
  points: POINTS,
  duration: DURATION,
  insuranceLimiter: signInInsurance,
});

export async function checkSignUpRateLimit(ip: string | null): Promise<void> {
  const key = ip ?? 'unknown';
  try {
    await signUpLimiter.consume(key);
  } catch (res) {
    if (res && typeof res === 'object' && 'msBeforeNext' in res) {
      const { msBeforeNext } = res as { msBeforeNext: number };
      const retrySecs = Math.ceil(msBeforeNext / 1000);
      throw new GraphQLError('Too many requests', {
        extensions: {
          code: 'TOO_MANY_REQUESTS',
          http: {
            status: 429,
            headers: new Headers({
              'Retry-After': String(retrySecs),
              'X-RateLimit-Limit': String(POINTS),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(
                Math.ceil(Date.now() / 1000 + retrySecs),
              ),
            }),
          },
        },
      });
    }
    throw res;
  }
}

export async function resetSignUpRateLimit(ip: string): Promise<void> {
  await Promise.allSettled([
    signUpLimiter.delete(ip),
    signUpInsurance.delete(ip),
  ]);
}

export async function checkSignInRateLimit(ip: string | null): Promise<void> {
  const key = ip ?? 'unknown';
  try {
    await signInLimiter.consume(key);
  } catch (res) {
    if (res && typeof res === 'object' && 'msBeforeNext' in res) {
      const { msBeforeNext } = res as { msBeforeNext: number };
      const retrySecs = Math.ceil(msBeforeNext / 1000);
      throw new Error(`Too many sign-in attempts. Try again in ${retrySecs}s.`);
    }
    throw res;
  }
}

export async function resetSignInRateLimit(ip: string): Promise<void> {
  await Promise.allSettled([
    signInLimiter.delete(ip),
    signInInsurance.delete(ip),
  ]);
}

const CREATE_USER_POINTS = 30;
const CREATE_USER_DURATION = 3600;

const createUserInsurance = new RateLimiterMemory({
  points: CREATE_USER_POINTS,
  duration: CREATE_USER_DURATION,
});
const createUserLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:createUser',
  points: CREATE_USER_POINTS,
  duration: CREATE_USER_DURATION,
  insuranceLimiter: createUserInsurance,
});

export async function checkCreateUserRateLimit(
  userId: string | null,
): Promise<void> {
  const key = userId ?? 'unknown';
  try {
    await createUserLimiter.consume(key);
  } catch (res) {
    if (res && typeof res === 'object' && 'msBeforeNext' in res) {
      const { msBeforeNext } = res as { msBeforeNext: number };
      const retrySecs = Math.ceil(msBeforeNext / 1000);
      throw new GraphQLError('Too many requests', {
        extensions: {
          code: 'TOO_MANY_REQUESTS',
          http: {
            status: 429,
            headers: new Headers({
              'Retry-After': String(retrySecs),
              'X-RateLimit-Limit': String(CREATE_USER_POINTS),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(
                Math.ceil(Date.now() / 1000 + retrySecs),
              ),
            }),
          },
        },
      });
    }
    throw res;
  }
}
