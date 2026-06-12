import { Resolver, Query, Mutation, Arg, Authorized } from 'type-graphql';
import type { FindOptionsWhere } from 'typeorm';
import { db } from '@/app/db/db';
import {
  Invoice,
  InvoicePayment,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoicesFilter,
  InvoicesSortInput,
  PaginatedInvoicesResponse,
  PaginationInput,
} from '@/app/db/entities';
import { PaymentStatus } from '@/app/db/entities/PaymentStatus';
import type { Client } from '@/app/db/entities/Client';
import type { Order } from '@/app/db/entities/Order';

@Resolver(Invoice)
export class InvoiceResolver {
  private repo = db.getRepository(Invoice);

  @Authorized()
  @Query(() => PaginatedInvoicesResponse)
  async invoices(
    @Arg('filter', () => InvoicesFilter, { nullable: true })
    filter?: InvoicesFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
    @Arg('sort', () => InvoicesSortInput, { nullable: true })
    sort?: InvoicesSortInput,
  ): Promise<PaginatedInvoicesResponse> {
    const skip = pagination?.offset ?? 0;
    const where: FindOptionsWhere<Invoice> = {};

    if (filter?.clientId) where.client = { id: filter.clientId };
    if (filter?.orderId) where.order = { id: filter.orderId };
    if (filter?.paymentStatus) where.paymentStatus = filter.paymentStatus;

    const field = sort?.field ?? 'createdDate';
    const order = sort?.order ?? 'ASC';

    const [items, total] = await this.repo.findAndCount({
      where,
      skip,
      take: pagination?.limit ?? 10,
      order: { [field]: order },
      relations: ['client', 'order'],
    });

    return { items, total };
  }

  @Authorized()
  @Query(() => Invoice, { nullable: true })
  async invoice(@Arg('id') id: string): Promise<Invoice | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['client', 'order'],
    });
  }

  @Query(() => InvoicePayment, { nullable: true })
  async invoicePayment(@Arg('id') id: string): Promise<InvoicePayment | null> {
    const invoice = await this.repo.findOne({
      where: { id },
      select: ['id', 'amount', 'paymentStatus'],
    });
    if (!invoice) return null;

    return invoice;
  }

  @Mutation(() => InvoicePayment)
  async payInvoice(@Arg('id') id: string): Promise<InvoicePayment> {
    const invoice = await this.repo.findOneByOrFail({ id });
    if (invoice.paymentStatus !== PaymentStatus.UNPAID) {
      throw new Error('This invoice has already been paid.');
    }
    invoice.paymentStatus = PaymentStatus.PAID;
    await this.repo.save(invoice);

    return this.repo.findOneOrFail({
      where: { id: invoice.id },
      select: ['id', 'amount', 'paymentStatus'],
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Invoice)
  async createInvoice(@Arg('data') data: CreateInvoiceInput): Promise<Invoice> {
    const { clientId, orderId, ...fields } = data;
    const invoice = this.repo.create({
      ...fields,
      client: { id: clientId } as Client,
      order: orderId ? ({ id: orderId } as Order) : undefined,
    });
    return this.repo.save(invoice);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Invoice)
  async updateInvoice(@Arg('data') data: UpdateInvoiceInput): Promise<Invoice> {
    const invoice = await this.repo.findOneByOrFail({ id: data.id });
    const { id: _id, ...fields } = data;
    Object.assign(invoice, fields);
    await this.repo.save(invoice);
    return this.repo.findOneOrFail({
      where: { id: invoice.id },
      relations: ['client', 'order'],
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Boolean)
  async deleteInvoice(@Arg('id') id: string): Promise<boolean> {
    const invoice = await this.repo.findOne({ where: { id } });
    if (!invoice) return false;

    await this.repo.remove(invoice);
    return true;
  }
}
