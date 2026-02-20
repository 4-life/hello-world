import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql';
import * as bcrypt from 'bcrypt';
import { db } from '@/app/db/db';
import {
  Post,
  User,
  UpdateUserInput,
  UsersFilter,
  PaginatedUsersResponse,
  PaginationInput,
} from '@/app/db/entities';
import type { Context } from '@/server/context';

@Resolver(User)
export class UserResolver {
  private repo = db.getRepository(User);

  @Authorized()
  @Query(() => PaginatedUsersResponse)
  async users(
    @Arg('filter', () => UsersFilter, { nullable: true }) filter?: UsersFilter,
    @Arg('pagination', () => PaginationInput, { nullable: true }) pagination?: PaginationInput
  ) {
    const skip = (pagination?.limit ?? 10) * ((pagination?.offset ?? 0) - 1);
    const where: any = {};

    if (filter?.id) where.id = filter.id;
    if (filter?.login) where.login = filter.login;
    if (filter?.role) where.role = filter.role;
    if (filter?.pinnedPostId) where.pinnedPost = { id: filter.pinnedPostId };

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['pinnedPost', 'posts'],
      skip,
      take: pagination?.limit ?? 10,
      order: { createdDate: 'ASC' },
    });

    return { items, total };
  }

  @Query(() => User, { nullable: true })
  async user(@Arg('id') id: string) {
    return this.repo.findOne({ where: { id }, relations: ['posts'] });
  }

  @Mutation(() => User)
  async updateProfile(@Ctx() ctx: Context, @Arg('data') data: UpdateUserInput) {
    const user = await this.repo.findOneByOrFail({ id: ctx.userId! });

    Object.assign(user, data);
    return this.repo.save(user);
  }

  @Mutation(() => User)
  async signUp(@Arg('email') email: string, @Arg('password') password: string) {
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
  @Mutation(() => User)
  async setPinnedPost(
    @Arg('userId') userId: string,
    @Arg('postId') postId: string
  ) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const post = await db.getRepository(Post).findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (!post) throw new Error('Post not found');

    if (post.author.id !== user.id) {
      throw new Error('Post does not belong to this user');
    }

    user.pinnedPost = post;
    return this.repo.save(user);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteUser(@Arg('id') id: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return false;

    await this.repo.remove(user);
    return true;
  }
}
