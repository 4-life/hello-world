import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { db } from '@/app/db/db';
import { Vacation } from './Vacation.entity';
import { CreateVacationInput } from './Vacation.inputs';
import { User } from '../user/User.entity';
import { invalidateUserCache } from '../user/User.cache';
import { createNotification } from '../notification/Notification.service';
import { calcAvailableDays, countDaysInclusive } from '@/app/libs/vacationDays';
import type { Context } from '@/server/context';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
      relations: { user: true },
    });
    if (!vacation) return false;

    const vacationUserId = vacation.user.id;
    await this.repo.remove(vacation);
    await invalidateUserCache(vacationUserId);

    if (ctx.userId && ctx.userId !== vacationUserId) {
      void createNotification(
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
    const user = await db.getRepository(User).findOneOrFail({
      where: { id: data.userId },
      relations: { vacations: true },
    });

    const available =
      calcAvailableDays(user.startWorkDate, user.vacations) ?? 0;
    const requested = countDaysInclusive(data.startDate, data.endDate);

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
    await invalidateUserCache(data.userId);

    if (ctx.userId && ctx.userId !== data.userId) {
      void createNotification(
        data.userId,
        `A vacation from ${formatDate(data.startDate)} to ${formatDate(data.endDate)} was added to your schedule.`,
      );
    }

    return saved;
  }
}
