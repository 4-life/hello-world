import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Authorized,
  FieldResolver,
  Root,
} from 'type-graphql';
import { ILike } from 'typeorm';
import { db } from '@/app/db/db';
import {
  Part,
  CreatePartInput,
  UpdatePartInput,
  PartsFilter,
  PaginatedPartsResponse,
  PaginationInput,
  EngineerStock,
  SetStockInput,
} from '@/app/db/entities';
import type { Engineer } from '@/app/db/entities/Engineer';

@Resolver(EngineerStock)
export class StoreResolver {
  private partsRepo = db.getRepository(Part);
  private stockRepo = db.getRepository(EngineerStock);

  @Authorized()
  @Query(() => PaginatedPartsResponse)
  async parts(
    @Arg('filter', () => PartsFilter, { nullable: true }) filter?: PartsFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
  ): Promise<PaginatedPartsResponse> {
    const skip = pagination?.offset ?? 0;

    const where = filter?.query
      ? [
          { name: ILike(`%${filter.query}%`) },
          { sku: ILike(`%${filter.query}%`) },
        ]
      : {};

    const [items, total] = await this.partsRepo.findAndCount({
      where,
      skip,
      take: pagination?.limit ?? 10,
      order: { name: 'ASC' },
    });

    return { items, total };
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Part)
  async createPart(@Arg('data') data: CreatePartInput): Promise<Part> {
    const part = this.partsRepo.create(data);
    return this.partsRepo.save(part);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Part)
  async updatePart(@Arg('data') data: UpdatePartInput): Promise<Part> {
    const part = await this.partsRepo.findOneByOrFail({ id: data.id });
    const { id: _id, ...fields } = data;
    Object.assign(part, fields);
    return this.partsRepo.save(part);
  }

  @Authorized('manager', 'admin')
  @Mutation(() => Boolean)
  async deletePart(@Arg('id') id: string): Promise<boolean> {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) return false;

    await this.partsRepo.remove(part);
    return true;
  }

  @Authorized('manager', 'admin')
  @Query(() => [EngineerStock])
  async engineerStock(
    @Arg('engineerId', () => String, { nullable: true }) engineerId?: string,
  ): Promise<EngineerStock[]> {
    return this.stockRepo.find({
      where: engineerId ? { engineer: { id: engineerId } } : {},
      relations: ['engineer', 'part'],
      order: { updatedDate: 'DESC' },
    });
  }

  @Authorized('manager', 'admin')
  @Mutation(() => EngineerStock)
  async setStock(@Arg('data') data: SetStockInput): Promise<EngineerStock> {
    let stock = await this.stockRepo.findOne({
      where: {
        engineer: { id: data.engineerId },
        part: { id: data.partId },
      },
      relations: ['engineer', 'part'],
    });

    if (!stock) {
      stock = this.stockRepo.create({
        engineer: { id: data.engineerId } as Engineer,
        part: { id: data.partId } as Part,
      });
    }

    stock.quantity = data.quantity;
    stock.minQuantity = data.minQuantity;

    const saved = await this.stockRepo.save(stock);
    return this.stockRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['engineer', 'part'],
    });
  }

  @FieldResolver(() => Boolean)
  isLowStock(@Root() stock: EngineerStock): boolean {
    return stock.quantity < stock.minQuantity;
  }
}
