import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { db } from '@/app/db/db';
import { Vacation, CreateVacationInput } from '@/app/db/entities/Vacation';
import { User } from '@/app/db/entities/User';
import { calcAvailableDays } from '@/app/libs/vacationDays';

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
  async deleteVacation(@Arg('id') id: string): Promise<boolean> {
    const vacation = await this.repo.findOne({ where: { id } });
    if (!vacation) return false;
    await this.repo.remove(vacation);
    return true;
  }

  @Mutation(() => Vacation)
  async createVacation(
    @Arg('data') data: CreateVacationInput,
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
    return this.repo.save(vacation);
  }
}
