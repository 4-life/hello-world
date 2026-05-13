import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { db } from '@/app/db/db';
import { Vacation, CreateVacationInput } from '@/app/db/entities/Vacation';
import { Notification } from '@/app/db/entities/Notification';
import { User } from '@/app/db/entities/User';
import { calcAvailableDays } from '@/app/libs/vacationDays';
import { notifier } from '@/server/notifier';
import type { Context } from '@/server/context';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

async function saveNotification(
  userId: string,
  message: string,
): Promise<void> {
  const notification = db
    .getRepository(Notification)
    .create({ userId, message });
  await db.getRepository(Notification).save(notification);
  notifier.emit(`user:${userId}`, { message });
}

@Resolver(Vacation)
export class VacationResolver {
  private repo = db.getRepository(Vacation);

  @Query(() => [Vacation])
  async vacations(@Arg('userId') userId: string): Promise<Vacation[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { startDate: 'ASC' },
    });
  }

  @Mutation(() => Boolean)
  async deleteVacation(
    @Arg('id') id: string,
    @Ctx() ctx: Context,
  ): Promise<boolean> {
    const vacation = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!vacation) return false;

    const vacationUserId = vacation.user.id;
    await this.repo.remove(vacation);

    if (ctx.userId && ctx.userId !== vacationUserId) {
      void saveNotification(
        vacationUserId,
        `Your vacation from ${formatDate(vacation.startDate)} to ${formatDate(vacation.endDate)} was removed.`,
      );
    }

    return true;
  }

  @Mutation(() => Vacation)
  async createVacation(
    @Arg('data') data: CreateVacationInput,
    @Ctx() ctx: Context,
  ): Promise<Vacation> {
    const user = await db
      .getRepository(User)
      .findOneOrFail({ where: { id: data.userId }, relations: ['vacations'] });

    const available =
      calcAvailableDays(user.startWorkDate, user.vacations) ?? 0;
    const newStart = new Date(data.startDate);
    const newEnd = new Date(data.endDate);
    const requested =
      Math.round((newEnd.getTime() - newStart.getTime()) / 86_400_000) + 1;

    if (requested > available) {
      throw new Error(
        `Not enough vacation days. Requested ${requested}, available ${available}.`,
      );
    }

    const vacation = this.repo.create({
      user,
      startDate: data.startDate,
      endDate: data.endDate,
      info: data.info,
    });
    const saved = await this.repo.save(vacation);

    if (ctx.userId && ctx.userId !== data.userId) {
      void saveNotification(
        data.userId,
        `A vacation from ${formatDate(newStart)} to ${formatDate(newEnd)} was added to your schedule.`,
      );
    }

    return saved;
  }
}
