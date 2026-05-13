import { Resolver, Query, Mutation, Ctx, Authorized } from 'type-graphql';
import { IsNull } from 'typeorm';
import { db } from '@/app/db/db';
import { Notification } from '@/app/db/entities/Notification';
import type { Context } from '@/server/context';

@Resolver(Notification)
export class NotificationResolver {
  private get repo(): ReturnType<typeof db.getRepository<Notification>> {
    return db.getRepository(Notification);
  }

  @Authorized()
  @Query(() => [Notification])
  async notifications(@Ctx() ctx: Context): Promise<Notification[]> {
    return this.repo.find({
      where: { userId: ctx.userId!, readAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  @Authorized()
  @Mutation(() => Boolean)
  async markNotificationsRead(@Ctx() ctx: Context): Promise<boolean> {
    await this.repo.update(
      { userId: ctx.userId!, readAt: IsNull() },
      { readAt: new Date() },
    );
    return true;
  }
}
