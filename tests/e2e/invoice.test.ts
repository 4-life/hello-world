import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { gql } from '../helpers/server';
import { ensureDb, truncateAll, createUser, createClient } from '../helpers/db';
import { UserRole } from '@/app/db/entities/UserRole';

const INVOICES = `
  query Invoices {
    invoices {
      items { id invoiceNumber amount paymentStatus client { id } }
      total
    }
  }
`;

const INVOICE = `
  query Invoice($id: String!) {
    invoice(id: $id) { id invoiceNumber amount paymentStatus client { id } order { id } }
  }
`;

const CREATE_INVOICE = `
  mutation CreateInvoice($data: CreateInvoiceInput!) {
    createInvoice(data: $data) { id invoiceNumber amount paymentStatus client { id } }
  }
`;

const UPDATE_INVOICE = `
  mutation UpdateInvoice($data: UpdateInvoiceInput!) {
    updateInvoice(data: $data) { id paymentStatus amount }
  }
`;

const DELETE_INVOICE = `
  mutation DeleteInvoice($id: String!) {
    deleteInvoice(id: $id)
  }
`;

describe('invoice', () => {
  beforeAll(async () => {
    await ensureDb();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  describe('invoices query', () => {
    it('rejects unauthenticated requests', async () => {
      const { errors } = await gql(INVOICES, {}, { userId: null, role: null, ip: null });
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('returns invoices for an authenticated user', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const client = await createClient({ name: 'Acme Properties LLC' });
      await gql(
        CREATE_INVOICE,
        { data: { clientId: client.id, amount: 150.5, issuedDate: '2026-06-01' } },
        { userId: user.id, role: UserRole.ADMIN, ip: null },
      );
      const { data } = await gql(INVOICES, {}, { userId: user.id, role: UserRole.USER, ip: null });
      expect(data?.invoices.total).toBe(1);
    });
  });

  describe('createInvoice', () => {
    it('rejects regular users', async () => {
      const user = await createUser({ email: 'user@test.com' });
      const client = await createClient({ name: 'Acme Properties LLC' });
      const { errors } = await gql(
        CREATE_INVOICE,
        { data: { clientId: client.id, amount: 100, issuedDate: '2026-06-01' } },
        { userId: user.id, role: UserRole.USER, ip: null },
      );
      expect(errors?.[0].message).toMatch(/access denied/i);
    });

    it('allows a manager to create an invoice', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const client = await createClient({ name: 'Acme Properties LLC' });
      const { data } = await gql(
        CREATE_INVOICE,
        { data: { clientId: client.id, amount: 250, issuedDate: '2026-06-01' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.createInvoice.amount).toBe(250);
      expect(data?.createInvoice.paymentStatus).toBe('UNPAID');
      expect(data?.createInvoice.client.id).toBe(client.id);
      expect(data?.createInvoice.invoiceNumber).toBeGreaterThan(0);
    });
  });

  describe('updateInvoice', () => {
    it('updates payment status and amount', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const client = await createClient({ name: 'Acme Properties LLC' });
      const { data: created } = await gql(
        CREATE_INVOICE,
        { data: { clientId: client.id, amount: 100, issuedDate: '2026-06-01' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      const { data } = await gql(
        UPDATE_INVOICE,
        { data: { id: created?.createInvoice.id, paymentStatus: 'PAID', amount: 120 } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      expect(data?.updateInvoice.paymentStatus).toBe('PAID');
      expect(data?.updateInvoice.amount).toBe(120);
    });
  });

  describe('deleteInvoice', () => {
    it('removes the invoice', async () => {
      const manager = await createUser({ email: 'manager@test.com', role: UserRole.MANAGER });
      const client = await createClient({ name: 'Acme Properties LLC' });
      const { data: created } = await gql(
        CREATE_INVOICE,
        { data: { clientId: client.id, amount: 100, issuedDate: '2026-06-01' } },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );

      const { data } = await gql(
        DELETE_INVOICE,
        { id: created?.createInvoice.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(data?.deleteInvoice).toBe(true);

      const { data: afterDelete } = await gql(
        INVOICE,
        { id: created?.createInvoice.id },
        { userId: manager.id, role: UserRole.MANAGER, ip: null },
      );
      expect(afterDelete?.invoice).toBeNull();
    });
  });
});
