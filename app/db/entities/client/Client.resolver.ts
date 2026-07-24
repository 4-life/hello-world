import { Resolver, Query, Mutation, Arg, Authorized } from 'type-graphql';
import type { FindOptionsWhere } from 'typeorm';
import { ILike } from 'typeorm';
import { db } from '@/app/db/db';
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientsFilter,
  ClientsSortInput,
  PaginatedClientsResponse,
  PaginationInput,
} from '@/app/db/entities';

@Resolver(Client)
export class ClientResolver {
  private repo = db.getRepository(Client);

  @Authorized()
  @Query(() => PaginatedClientsResponse)
  async clients(
    @Arg('filter', () => ClientsFilter, { nullable: true })
    filter?: ClientsFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
    @Arg('sort', () => ClientsSortInput, { nullable: true })
    sort?: ClientsSortInput,
  ): Promise<PaginatedClientsResponse> {
    const skip = pagination?.offset ?? 0;
    const base: FindOptionsWhere<Client> = {};

    if (filter?.id) base.id = filter.id;

    const where: FindOptionsWhere<Client> | FindOptionsWhere<Client>[] =
      filter?.query
        ? [
            { ...base, name: ILike(`%${filter.query}%`) },
            { ...base, email: ILike(`%${filter.query}%`) },
            { ...base, phone: ILike(`%${filter.query}%`) },
          ]
        : base;

    const field = sort?.field ?? 'createdDate';
    const order = sort?.order ?? 'ASC';

    const [items, total] = await this.repo.findAndCount({
      where,
      skip,
      take: pagination?.limit ?? 10,
      order: { [field]: order },
      relations: ['invoices'],
    });

    return { items, total };
  }

  @Authorized()
  @Query(() => Client, { nullable: true })
  async client(@Arg('id') id: string): Promise<Client | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['invoices', 'invoices.order'],
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Client)
  async createClient(@Arg('data') data: CreateClientInput): Promise<Client> {
    const client = this.repo.create(data);
    return this.repo.save(client);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Client)
  async updateClient(@Arg('data') data: UpdateClientInput): Promise<Client> {
    const client = await this.repo.findOneByOrFail({ id: data.id });
    const { id: _id, ...fields } = data;
    Object.assign(client, fields);
    return this.repo.save(client);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Boolean)
  async deleteClient(@Arg('id') id: string): Promise<boolean> {
    const client = await this.repo.findOne({ where: { id } });
    if (!client) return false;

    await this.repo.remove(client);
    return true;
  }
}
