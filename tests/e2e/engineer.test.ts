import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { gql } from '../helpers/server';
import { ensureDb, truncateAll, createUser, createEngineer } from '../helpers/db';
import { UserRole } from '@/app/db/entities/UserRole';

const ENGINEERS = `
  query Engineers {
    engineers {
      items { id firstName lastName isActive }
      total
    }
  }
`;

const ENGINEER = `
  query Engineer($id: String!) {
    engineer(id: $id) { id firstName lastName orders { id } stock { id } }
  }
`;

const CREATE_ENGINEER = `
  mutation CreateEngineer($data: CreateEngineerInput!) {
    createEngineer(data: $data) { id firstName lastName isActive }
  }
`;

const UPDATE_ENGINEER = `
  mutation UpdateEngineer($data: UpdateEngineerInput!) {
    updateEngineer(data: $data) { id isActive specialization }
  }
`;

const DELETE_ENGINEER = `
  mutation DeleteEngineer($id: String!) {
    deleteEngineer(id: $id)
  }
`;

describe('engineer', () => {
  beforeAll(async () => {
    await ensureDb();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  describe('engineers query', () => {
    it('rejects unauthenticated requests', async () => {
      const { errors } = await gql(ENGINEERS, {}, { userId: null, role: null, ip: null });
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('returns engineers for an authenticated user', async () => {
      const user = await createUser({ email: 'user@test.com' });
      await createEngineer({ firstName: 'Mike', lastName: 'Sullivan' });
      const { data } = await gql(ENGINEERS, {}, { userId: user.id, role: UserRole.USER, ip: null });
      expect(data?.engineers.total).toBe(1);
    });
  });

  describe('engineer query', () => {
    it('returns the engineer with orders and stock', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const engineer = await createEngineer({ firstName: 'Mike', lastName: 'Sullivan' });
      const { data } = await gql(ENGINEER, { id: engineer.id }, { userId: user.id, role: UserRole.USER, ip: null });
      expect(data?.engineer.id).toBe(engineer.id);
      expect(data?.engineer.orders).toEqual([]);
      expect(data?.engineer.stock).toEqual([]);
    });
  });

  describe('createEngineer', () => {
    it('rejects regular users', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const { errors } = await gql(
        CREATE_ENGINEER,
        { data: { firstName: 'Anna', lastName: 'Kowalski' } },
        { userId: user.id, role: UserRole.USER, ip: null },
      );
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('allows a manager to create an engineer', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const { data } = await gql(
        CREATE_ENGINEER,
        { data: { firstName: 'Anna', lastName: 'Kowalski' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.createEngineer.firstName).toBe('Anna');
      expect(data?.createEngineer.isActive).toBe(true);
    });
  });

  describe('updateEngineer', () => {
    it('updates engineer fields', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const engineer = await createEngineer({ firstName: 'Anna', lastName: 'Kowalski' });

      const { data } = await gql(
        UPDATE_ENGINEER,
        { data: { id: engineer.id, isActive: false, specialization: 'HVAC' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      expect(data?.updateEngineer.isActive).toBe(false);
      expect(data?.updateEngineer.specialization).toBe('HVAC');
    });
  });

  describe('deleteEngineer', () => {
    it('removes the engineer', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const engineer = await createEngineer({ firstName: 'Anna', lastName: 'Kowalski' });

      const { data } = await gql(
        DELETE_ENGINEER,
        { id: engineer.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.deleteEngineer).toBe(true);

      const { data: afterDelete } = await gql(
        ENGINEER,
        { id: engineer.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(afterDelete?.engineer).toBeNull();
    });
  });
});
