import { db, dbInit } from '@/app/db/db';
import { User } from '@/app/db/entities/User';
import { UserRole } from '@/app/db/entities/UserRole';
import bcrypt from 'bcrypt';

export async function ensureDb(): Promise<void> {
  await dbInit;
  await db.runMigrations();
}

export async function truncateAll(): Promise<void> {
  await db.query(
    'TRUNCATE TABLE vacations, notifications, users RESTART IDENTITY CASCADE',
  );
}

export async function createUser(opts: {
  email: string;
  password?: string;
  role?: UserRole;
}): Promise<User> {
  const repo = db.getRepository(User);
  const user = repo.create({
    email: opts.email,
    login: opts.email,
    password: opts.password ?? (await bcrypt.hash('password', 1)),
    role: opts.role ?? UserRole.USER,
  });
  return repo.save(user);
}
