#!/usr/bin/env node
// pretest:e2e hook — starts the local Postgres/Redis test stack (matching
// .github/workflows/e2e.yml's env) if nothing is already listening on 5432,
// then runs migrations against it. In CI, GitHub Actions' native `services:`
// already bind that port before `npm run test:e2e` runs, so this is a no-op
// there beyond the (idempotent) migration run.
import { spawnSync } from 'node:child_process';
import net from 'node:net';

const TEST_DB_ENV = {
  POSTGRES_USER: 'myuser',
  POSTGRES_PASSWORD: 'password',
  POSTGRES_DB: 'test_hello_world',
  POSTGRES_HOST: 'localhost',
  REDIS_URL: 'redis://localhost:6379',
  NEXTAUTH_SECRET: 'test-secret',
};

function portOpen(port, host = '127.0.0.1', timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    const finish = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

function run(command, args, env) {
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function main() {
  if (await portOpen(5432)) {
    console.log('Postgres already reachable on localhost:5432 — reusing existing services.');
  } else {
    console.log('Postgres not reachable on localhost:5432 — starting local test services (docker compose)...');
    run('docker', ['compose', '-f', 'docker/test/compose.yaml', 'up', '-d', '--wait']);
  }

  console.log(`Running migrations against ${TEST_DB_ENV.POSTGRES_DB}...`);
  run('npm', ['run', 'migration:run'], { ...process.env, ...TEST_DB_ENV });
}

main();
