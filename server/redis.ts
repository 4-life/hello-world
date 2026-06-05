import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379', {
  maxRetriesPerRequest: 2,
});

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'test') console.error('[Redis]', err.message);
});
