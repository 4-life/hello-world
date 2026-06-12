import { db, dbInit } from '@/app/db/db';
import { User } from '@/app/db/entities/User';
import { UserRole } from '@/app/db/entities/UserRole';
import { Engineer } from '@/app/db/entities/Engineer';
import { Client } from '@/app/db/entities/Client';
import bcrypt from 'bcrypt';

export async function ensureDb(): Promise<void> {
  await dbInit;
  await db.runMigrations();
}

export async function truncateAll(): Promise<void> {
  await db.query(
    'TRUNCATE TABLE engineer_stock, invoices, orders, parts, engineers, clients, notifications, users RESTART IDENTITY CASCADE',
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

export async function createEngineer(opts: {
  firstName: string;
  lastName: string;
  isActive?: boolean;
}): Promise<Engineer> {
  const repo = db.getRepository(Engineer);
  const engineer = repo.create({
    firstName: opts.firstName,
    lastName: opts.lastName,
    isActive: opts.isActive ?? true,
  });
  return repo.save(engineer);
}

export async function createClient(opts: {
  name: string;
  email?: string;
}): Promise<Client> {
  const repo = db.getRepository(Client);
  const client = repo.create({
    name: opts.name,
    email: opts.email,
  });
  return repo.save(client);
}
