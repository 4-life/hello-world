import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { gql } from '../helpers/server';
import { ensureDb, truncateAll, createUser, createClient } from '../helpers/db';
import { UserRole } from '@/app/db/entities/UserRole';

const CLIENTS = `
  query Clients {
    clients {
      items { id name email }
      total
    }
  }
`;

const CLIENT = `
  query Client($id: String!) {
    client(id: $id) { id name invoices { id } }
  }
`;

const CREATE_CLIENT = `
  mutation CreateClient($data: CreateClientInput!) {
    createClient(data: $data) { id name email phone address }
  }
`;

const UPDATE_CLIENT = `
  mutation UpdateClient($data: UpdateClientInput!) {
    updateClient(data: $data) { id name phone }
  }
`;

const DELETE_CLIENT = `
  mutation DeleteClient($id: String!) {
    deleteClient(id: $id)
  }
`;

describe('client', () => {
  beforeAll(async () => {
    await ensureDb();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  describe('clients query', () => {
    it('rejects unauthenticated requests', async () => {
      const { errors } = await gql(CLIENTS, {}, { userId: null, role: null, ip: null });
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('returns clients for an authenticated user', async () => {
      const user = await createUser({ email: 'user@test.com' });
      await createClient({ name: 'Acme Properties LLC' });
      const { data } = await gql(CLIENTS, {}, { userId: user.id, role: UserRole.USER, ip: null });
      expect(data?.clients.total).toBe(1);
    });
  });

  describe('client query', () => {
    it('returns the client with its invoices', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const client = await createClient({ name: 'Acme Properties LLC' });
      const { data } = await gql(CLIENT, { id: client.id }, { userId: user.id, role: UserRole.USER, ip: null });
      expect(data?.client.id).toBe(client.id);
      expect(data?.client.invoices).toEqual([]);
    });
  });

  describe('createClient', () => {
    it('rejects regular users', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const { errors } = await gql(
        CREATE_CLIENT,
        { data: { name: 'Greenfield Holdings' } },
        { userId: user.id, role: UserRole.USER, ip: null },
      );
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('allows a manager to create a client', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const { data } = await gql(
        CREATE_CLIENT,
        { data: { name: 'Greenfield Holdings', email: 'billing@greenfield.test' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.createClient.name).toBe('Greenfield Holdings');
      expect(data?.createClient.email).toBe('billing@greenfield.test');
    });
  });

  describe('updateClient', () => {
    it('updates client fields', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const client = await createClient({ name: 'Greenfield Holdings' });

      const { data } = await gql(
        UPDATE_CLIENT,
        { data: { id: client.id, phone: '+1 555 123 4567' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      expect(data?.updateClient.phone).toBe('+1 555 123 4567');
    });
  });

  describe('deleteClient', () => {
    it('removes the client', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const client = await createClient({ name: 'Greenfield Holdings' });

      const { data } = await gql(
        DELETE_CLIENT,
        { id: client.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.deleteClient).toBe(true);

      const { data: afterDelete } = await gql(
        CLIENT,
        { id: client.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(afterDelete?.client).toBeNull();
    });
  });
});
