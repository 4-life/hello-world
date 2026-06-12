import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { gql } from '../helpers/server';
import { ensureDb, truncateAll, createUser, createEngineer } from '../helpers/db';
import { UserRole } from '@/app/db/entities/UserRole';

const ORDERS = `
  query Orders {
    orders {
      items { id orderNumber type status }
      total
    }
  }
`;

const ORDER = `
  query Order($id: String!) {
    order(id: $id) { id orderNumber type status engineer { id firstName } }
  }
`;

const CREATE_ORDER = `
  mutation CreateOrder($data: CreateOrderInput!) {
    createOrder(data: $data) { id orderNumber type status }
  }
`;

const UPDATE_ORDER = `
  mutation UpdateOrder($data: UpdateOrderInput!) {
    updateOrder(data: $data) {
      id
      status
      engineer { id firstName }
    }
  }
`;

const DELETE_ORDER = `
  mutation DeleteOrder($id: String!) {
    deleteOrder(id: $id)
  }
`;

describe('order', () => {
  beforeAll(async () => {
    await ensureDb();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  describe('orders query', () => {
    it('rejects unauthenticated requests', async () => {
      const { errors } = await gql(ORDERS, {}, { userId: null, role: null, ip: null });
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('returns orders for an authenticated user', async () => {
      const user = await createUser({ email: 'user@test.com' });
      await gql(
        CREATE_ORDER,
        { data: { type: 'INSTALLATION' } },
        { userId: user.id, role: UserRole.ADMIN, ip: null },
      );
      const { data } = await gql(ORDERS, {}, { userId: user.id, role: UserRole.USER, ip: null });
      expect(data?.orders.total).toBe(1);
    });
  });

  describe('createOrder', () => {
    it('rejects regular users', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const { errors } = await gql(
        CREATE_ORDER,
        { data: { type: 'INSTALLATION' } },
        { userId: user.id, role: UserRole.USER, ip: null },
      );
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('allows a manager to create an order', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const { data } = await gql(
        CREATE_ORDER,
        { data: { type: 'MAINTENANCE' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.createOrder.type).toBe('MAINTENANCE');
      expect(data?.createOrder.status).toBe('NEW');
      expect(data?.createOrder.orderNumber).toBeGreaterThan(0);
    });
  });

  describe('updateOrder', () => {
    it('updates status and assigns an engineer', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const engineer = await createEngineer({ firstName: 'Mike', lastName: 'Sullivan' });
      const { data: created } = await gql(
        CREATE_ORDER,
        { data: { type: 'REPAIR' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      const { data } = await gql(
        UPDATE_ORDER,
        { data: { id: created?.createOrder.id, status: 'SCHEDULED', engineerId: engineer.id } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      expect(data?.updateOrder.status).toBe('SCHEDULED');
      expect(data?.updateOrder.engineer?.id).toBe(engineer.id);
    });

    it('unassigns an engineer when engineerId is null', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const engineer = await createEngineer({ firstName: 'Mike', lastName: 'Sullivan' });
      const { data: created } = await gql(
        CREATE_ORDER,
        { data: { type: 'REPAIR', engineerId: engineer.id } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      const { data } = await gql(
        UPDATE_ORDER,
        { data: { id: created?.createOrder.id, engineerId: null } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      expect(data?.updateOrder.engineer).toBeNull();
    });
  });

  describe('deleteOrder', () => {
    it('removes the order', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const { data: created } = await gql(
        CREATE_ORDER,
        { data: { type: 'INSTALLATION' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      const { data } = await gql(
        DELETE_ORDER,
        { id: created?.createOrder.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.deleteOrder).toBe(true);

      const { data: afterDelete } = await gql(
        ORDER,
        { id: created?.createOrder.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(afterDelete?.order).toBeNull();
    });
  });
});
