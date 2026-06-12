import { Resolver, Query, Mutation, Arg, Authorized } from 'type-graphql';
import type { FindOptionsWhere } from 'typeorm';
import { ILike } from 'typeorm';
import { db } from '@/app/db/db';
import {
  Engineer,
  CreateEngineerInput,
  UpdateEngineerInput,
  EngineersFilter,
  EngineersSortInput,
  PaginatedEngineersResponse,
  PaginationInput,
} from '@/app/db/entities';

@Resolver(Engineer)
export class EngineerResolver {
  private repo = db.getRepository(Engineer);

  @Authorized()
  @Query(() => PaginatedEngineersResponse)
  async engineers(
    @Arg('filter', () => EngineersFilter, { nullable: true })
    filter?: EngineersFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
    @Arg('sort', () => EngineersSortInput, { nullable: true })
    sort?: EngineersSortInput,
  ): Promise<PaginatedEngineersResponse> {
    const skip = pagination?.offset ?? 0;
    const base: FindOptionsWhere<Engineer> = {};

    if (filter?.id) base.id = filter.id;
    if (filter?.isActive !== undefined) base.isActive = filter.isActive;

    const where: FindOptionsWhere<Engineer> | FindOptionsWhere<Engineer>[] =
      filter?.query
        ? [
            { ...base, firstName: ILike(`%${filter.query}%`) },
            { ...base, lastName: ILike(`%${filter.query}%`) },
            { ...base, email: ILike(`%${filter.query}%`) },
          ]
        : base;

    const field = sort?.field ?? 'createdDate';
    const order = sort?.order ?? 'ASC';

    const [items, total] = await this.repo.findAndCount({
      where,
      skip,
      take: pagination?.limit ?? 10,
      order: { [field]: order },
      relations: ['orders'],
    });

    return { items, total };
  }

  @Authorized()
  @Query(() => Engineer, { nullable: true })
  async engineer(@Arg('id') id: string): Promise<Engineer | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['orders', 'stock', 'stock.part'],
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Engineer)
  async createEngineer(
    @Arg('data') data: CreateEngineerInput,
  ): Promise<Engineer> {
    const engineer = this.repo.create(data);
    return this.repo.save(engineer);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Engineer)
  async updateEngineer(
    @Arg('data') data: UpdateEngineerInput,
  ): Promise<Engineer> {
    const engineer = await this.repo.findOneByOrFail({ id: data.id });
    const { id: _id, ...fields } = data;
    Object.assign(engineer, fields);
    return this.repo.save(engineer);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Boolean)
  async deleteEngineer(@Arg('id') id: string): Promise<boolean> {
    const engineer = await this.repo.findOne({ where: { id } });
    if (!engineer) return false;

    await this.repo.remove(engineer);
    return true;
  }
}
