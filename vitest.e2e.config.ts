import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'path';

// Defaults for local dev — CI overrides these via workflow env vars
process.env.POSTGRES_HOST ??= 'localhost';
process.env.POSTGRES_USER ??= 'myuser';
process.env.POSTGRES_PASSWORD ??= 'password';
process.env.POSTGRES_DB ??= 'test_hello_world';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.NEXTAUTH_SECRET ??= 'test-secret';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorMetadata: true },
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    include: ['tests/e2e/**/*.test.ts'],
    environment: 'node',
    testTimeout: 15_000,
    hookTimeout: 30_000,
    setupFiles: ['reflect-metadata'],
    pool: 'forks',
  },
});
