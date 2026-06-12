import { Resolver, Query, Mutation, Arg, Authorized } from 'type-graphql';
import type { FindOptionsWhere } from 'typeorm';
import { db } from '@/app/db/db';
import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrdersFilter,
  OrdersSortInput,
  PaginatedOrdersResponse,
  PaginationInput,
} from '@/app/db/entities';
import type { Engineer } from '@/app/db/entities/Engineer';

@Resolver(Order)
export class OrderResolver {
  private repo = db.getRepository(Order);

  @Authorized()
  @Query(() => PaginatedOrdersResponse)
  async orders(
    @Arg('filter', () => OrdersFilter, { nullable: true })
    filter?: OrdersFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
    @Arg('sort', () => OrdersSortInput, { nullable: true })
    sort?: OrdersSortInput,
  ): Promise<PaginatedOrdersResponse> {
    const skip = pagination?.offset ?? 0;
    const where: FindOptionsWhere<Order> = {};

    if (filter?.id) where.id = filter.id;
    if (filter?.type) where.type = filter.type;
    if (filter?.status) where.status = filter.status;
    if (filter?.engineerId) where.engineer = { id: filter.engineerId };
    if (filter?.orderNumber) where.orderNumber = filter.orderNumber;

    const field = sort?.field ?? 'createdDate';
    const order = sort?.order ?? 'ASC';

    const [items, total] = await this.repo.findAndCount({
      where,
      skip,
      take: pagination?.limit ?? 10,
      order: { [field]: order },
      relations: ['engineer', 'invoice', 'invoice.client'],
    });

    return { items, total };
  }

  @Authorized()
  @Query(() => Order, { nullable: true })
  async order(@Arg('id') id: string): Promise<Order | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['engineer', 'invoice', 'invoice.client'],
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Order)
  async createOrder(@Arg('data') data: CreateOrderInput): Promise<Order> {
    const { engineerId, ...fields } = data;
    const order = this.repo.create({
      ...fields,
      engineer: engineerId ? ({ id: engineerId } as Engineer) : undefined,
    });
    return this.repo.save(order);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Order)
  async updateOrder(@Arg('data') data: UpdateOrderInput): Promise<Order> {
    const order = await this.repo.findOneOrFail({
      where: { id: data.id },
      relations: ['engineer'],
    });

    const { id: _id, engineerId, ...fields } = data;
    Object.assign(order, fields);

    if (engineerId !== undefined) {
      order.engineer = engineerId ? ({ id: engineerId } as Engineer) : null;
    }

    await this.repo.save(order);
    return this.repo.findOneOrFail({
      where: { id: order.id },
      relations: ['engineer'],
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Boolean)
  async deleteOrder(@Arg('id') id: string): Promise<boolean> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) return false;

    await this.repo.remove(order);
    return true;
  }
}
