import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  FieldResolver,
  Root,
  ObjectType,
  Field,
} from 'type-graphql';
import * as bcrypt from 'bcrypt';
import { db } from '@/app/db/db';
import {
  User,
  UpdateUserInput,
  UsersFilter,
  UsersSortInput,
  PaginatedUsersResponse,
  PaginationInput,
} from '@/app/db/entities';
import type { Context } from '@/server/context';
import type { FindOptionsWhere } from 'typeorm';
import { ILike } from 'typeorm';
import {
  isAllowedAvatarContentType,
  buildAvatarKey,
  getPresignedUploadUrl,
  getPresignedReadUrl,
  validateAndCleanup,
  contentTypeFromKey,
  deleteObject,
} from '@/lib/s3';

@ObjectType('AvatarUploadResponse')
class AvatarUploadResponse {
  @Field()
  uploadUrl: string;

  @Field()
  key: string;
}

@Resolver(User)
export class UserResolver {
  private repo = db.getRepository(User);

  @Authorized('manager', 'admin')
  @Query(() => PaginatedUsersResponse)
  async users(
    @Arg('filter', () => UsersFilter, { nullable: true }) filter?: UsersFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
    @Arg('sort', () => UsersSortInput, { nullable: true })
    sort?: UsersSortInput,
  ): Promise<PaginatedUsersResponse> {
    const skip = pagination?.offset ?? 0;
    const where: FindOptionsWhere<User> = {};

    if (filter?.id) where.id = filter.id;
    if (filter?.login) where.login = filter.login;
    if (filter?.email) where.email = ILike(`%${filter.email}%`);
    if (filter?.role) where.role = filter.role;

    const field = sort?.field ?? 'createdDate';
    const order = sort?.order ?? 'ASC';

    const [items, total] = await this.repo.findAndCount({
      where,
      skip,
      take: pagination?.limit ?? 10,
      order: { [field]: order },
      relations: ['vacations'],
    });

    return { items, total };
  }

  @Query(() => User, { nullable: true })
  async user(@Arg('id') id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['vacations'] });
  }

  @Authorized()
  @Mutation(() => User)
  async updateProfile(
    @Ctx() ctx: Context,
    @Arg('data') data: UpdateUserInput,
  ): Promise<User> {
    const targetId = data.id ?? ctx.userId!;
    const isOtherUser = targetId !== ctx.userId;

    if (isOtherUser && ctx.role !== 'admin' && ctx.role !== 'manager') {
      throw new Error('Not authorized to update other users');
    }

    const user = await this.repo.findOneByOrFail({ id: targetId });
    const { id: _, ...fields } = data;
    Object.assign(user, fields);
    return this.repo.save(user);
  }

  @Mutation(() => User)
  async signUp(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ): Promise<User> {
    const repo = this.repo;

    if (await repo.findOne({ where: { email } })) {
      throw new Error('User already exists');
    }

    const user = repo.create({
      email,
      password: await bcrypt.hash(password, 10),
    });

    return repo.save(user);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteUser(@Arg('id') id: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return false;

    await this.repo.remove(user);
    return true;
  }

  @FieldResolver(() => String, { nullable: true })
  async avatar(@Root() user: User): Promise<string | null> {
    if (!user.avatar) return null;
    return getPresignedReadUrl(user.avatar);
  }

  @Authorized()
  @Mutation(() => AvatarUploadResponse)
  async requestAvatarUploadUrl(
    @Ctx() ctx: Context,
    @Arg('contentType') contentType: string,
    @Arg('targetUserId', () => String, { nullable: true })
    targetUserId?: string,
  ): Promise<AvatarUploadResponse> {
    const targetId = targetUserId ?? ctx.userId!;

    if (
      targetId !== ctx.userId &&
      ctx.role !== 'admin' &&
      ctx.role !== 'manager'
    ) {
      throw new Error('Not authorized to update other users');
    }

    if (!isAllowedAvatarContentType(contentType)) {
      throw new Error(
        'Unsupported content type. Allowed: image/jpeg, image/png, image/webp',
      );
    }

    const key = buildAvatarKey(targetId, contentType);
    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    return { uploadUrl, key };
  }

  @Authorized()
  @Mutation(() => User)
  async confirmAvatarUpload(
    @Ctx() ctx: Context,
    @Arg('key') key: string,
    @Arg('targetUserId', () => String, { nullable: true })
    targetUserId?: string,
  ): Promise<User> {
    const targetId = targetUserId ?? ctx.userId!;

    if (
      targetId !== ctx.userId &&
      ctx.role !== 'admin' &&
      ctx.role !== 'manager'
    ) {
      throw new Error('Not authorized to update other users');
    }

    if (!key.startsWith(`avatars/${targetId}/`)) {
      throw new Error('Invalid key');
    }

    const contentType = contentTypeFromKey(key);
    if (!contentType) {
      throw new Error('Unrecognised file extension in key');
    }

    const isValid = await validateAndCleanup(key, contentType);
    if (!isValid) {
      throw new Error('File content does not match the declared image type');
    }

    const existing = await this.repo.findOneByOrFail({ id: targetId });
    if (existing.avatar && existing.avatar !== key) {
      await deleteObject(existing.avatar);
    }

    await this.repo.update({ id: targetId }, { avatar: key });
    return this.repo.findOneByOrFail({ id: targetId });
  }
}
