import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { gql } from '../helpers/server';
import { ensureDb, truncateAll, createUser } from '../helpers/db';
import { UserRole } from '@/app/db/entities/user/User.types';
import { resetSignUpRateLimit } from '@/server/rateLimiter';

const SIGN_UP = `
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) { id email }
  }
`;

const GET_USER = `
  query GetUser($id: String!) {
    user(id: $id) { id email role }
  }
`;

const UPDATE_PROFILE = `
  mutation UpdateProfile($data: UpdateUserInput!) {
    updateProfile(data: $data) { id firstName role }
  }
`;

describe('user', () => {
  beforeAll(async () => {
    await ensureDb();
  });

  beforeEach(async () => {
    await truncateAll();
    await resetSignUpRateLimit('unknown');
    await resetSignUpRateLimit('test-rl-ip');
  });

  describe('signUp', () => {
    it('creates a new user', async () => {
      const { data } = await gql(SIGN_UP, { email: 'new@test.com', password: 'secret' });
      expect(data?.signUp.email).toBe('new@test.com');
    });

    it('rejects duplicate email', async () => {
      await createUser({ email: 'dup@test.com' });
      const { errors } = await gql(SIGN_UP, { email: 'dup@test.com', password: 'secret' });
      expect(errors?.[0].message).toMatch(/already exists/i);
    });

    it('returns 429 after 5 attempts from the same IP', async () => {
      const ip = 'test-rl-ip';
      for (let i = 0; i < 5; i++) {
        await gql(SIGN_UP, { email: `rl${i}@test.com`, password: 'secret' }, { userId: null, role: null, ip });
      }
      const { errors } = await gql(SIGN_UP, { email: 'blocked@test.com', password: 'secret' }, { userId: null, role: null, ip });
      expect(errors?.[0].message).toMatch(/too many requests/i);
      expect(errors?.[0].extensions?.code).toBe('TOO_MANY_REQUESTS');
    });
  });

  describe('user query', () => {
    it('rejects unauthenticated requests', async () => {
      const { errors } = await gql(GET_USER, { id: 'non-existent' });
      expect(errors).toBeDefined();
    });

    it('returns null for unknown id', async () => {
      const user = await createUser({ email: 'me@test.com' });
      const { data } = await gql(
        GET_USER,
        { id: 'non-existent' },
        { userId: user.id, role: UserRole.USER, ip: null },
      );
      expect(data?.user).toBeNull();
    });

    it('allows a user to view their own record', async () => {
      const user = await createUser({ email: 'me@test.com' });
      const { data } = await gql(
        GET_USER,
        { id: user.id },
        { userId: user.id, role: UserRole.USER, ip: null },
      );
      expect(data?.user.id).toBe(user.id);
      expect(data?.user.email).toBe('me@test.com');
    });

    it('prevents a regular user from viewing another user', async () => {
      const me = await createUser({ email: 'me@test.com' });
      const other = await createUser({ email: 'other@test.com' });
      const { errors } = await gql(
        GET_USER,
        { id: other.id },
        { userId: me.id, role: UserRole.USER, ip: null },
      );
      expect(errors?.[0].message).toMatch(/not authorized/i);
    });

    it('allows an admin to view any user', async () => {
      const admin = await createUser({
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });
      const other = await createUser({ email: 'other@test.com' });
      const { data } = await gql(
        GET_USER,
        { id: other.id },
        { userId: admin.id, role: UserRole.ADMIN, ip: null },
      );
      expect(data?.user.id).toBe(other.id);
    });
  });

  describe('updateProfile', () => {
    it('rejects unauthenticated requests', async () => {
      const { errors } = await gql(
        UPDATE_PROFILE,
        { data: { firstName: 'Pavel' } },
        { userId: null, role: null },
      );
      expect(errors).toBeDefined();
    });

    it('allows a user to update their own profile', async () => {
      const user = await createUser({ email: 'me@test.com' });
      const { data } = await gql(
        UPDATE_PROFILE,
        { data: { firstName: 'Pavel' } },
        { userId: user.id, role: UserRole.USER },
      );
      expect(data?.updateProfile.firstName).toBe('Pavel');
    });

    it('prevents a regular user from updating another user', async () => {
      const me = await createUser({ email: 'me@test.com' });
      const other = await createUser({ email: 'other@test.com' });
      const { errors } = await gql(
        UPDATE_PROFILE,
        { data: { id: other.id, firstName: 'Hacker' } },
        { userId: me.id, role: UserRole.USER },
      );
      expect(errors?.[0].message).toMatch(/not authorized/i);
    });

    it('prevents a regular user from escalating their own role', async () => {
      const user = await createUser({ email: 'me@test.com' });
      const { errors } = await gql(
        UPDATE_PROFILE,
        { data: { role: UserRole.ADMIN } },
        { userId: user.id, role: UserRole.USER },
      );
      expect(errors?.[0].message).toMatch(/not authorized/i);
    });

    it('allows an admin to change a user role', async () => {
      const admin = await createUser({
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });
      const user = await createUser({ email: 'user@test.com' });
      const { data } = await gql(
        UPDATE_PROFILE,
        { data: { id: user.id, role: UserRole.MANAGER } },
        { userId: admin.id, role: UserRole.ADMIN },
      );
      expect(data?.updateProfile.role).toBe(UserRole.MANAGER);
    });

    it('allows an admin to update any user', async () => {
      const admin = await createUser({ email: 'admin@test.com', role: UserRole.ADMIN });
      const user = await createUser({ email: 'user@test.com' });
      const { data } = await gql(
        UPDATE_PROFILE,
        { data: { id: user.id, firstName: 'Updated' } },
        { userId: admin.id, role: UserRole.ADMIN },
      );
      expect(data?.updateProfile.firstName).toBe('Updated');
    });
  });
});
