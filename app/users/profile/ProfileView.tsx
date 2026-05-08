import Image from 'next/image';
import getUser from '@/app/libs/getUser';
import { calcAvailableDays } from '@/app/libs/vacationDays';
import VacationCalendar from '@/components/VacationCalendar';

interface Props {
  userId: string;
}

export default async function ProfileView({
  userId,
}: Props): Promise<React.JSX.Element> {
  const { data, error } = await getUser(userId);

  if (error || !data?.user) {
    return <p className="p-6 text-destructive">Failed to load profile.</p>;
  }

  const user = data.user;
  const availableVacationDays = calcAvailableDays(
    user.startWorkDate,
    user.vacations,
  );

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      {availableVacationDays !== null && (
        <div className="mt-8 rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Available vacation days
          </p>
          <p className="mt-1 text-6xl font-bold">{availableVacationDays}</p>
        </div>
      )}

      <h2 className="mt-8 mb-4 text-lg font-semibold">Vacations</h2>
      <VacationCalendar
        vacations={user.vacations}
        availableDays={availableVacationDays ?? 0}
        userId={userId}
      />

      <div className="rounded-lg border p-6 space-y-4 mt-6">
        {user.avatar && (
          <Image
            src={user.avatar}
            alt={user.login}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <span className="text-muted-foreground">Login</span>
          <span>{user.login}</span>

          <span className="text-muted-foreground">First name</span>
          <span>{user.firstName ?? '—'}</span>

          <span className="text-muted-foreground">Last name</span>
          <span>{user.lastName ?? '—'}</span>

          <span className="text-muted-foreground">Email</span>
          <span>{user.email ?? '—'}</span>

          <span className="text-muted-foreground">Phone</span>
          <span>{user.phone ?? '—'}</span>

          <span className="text-muted-foreground">Role</span>
          <span className="capitalize">{user.role}</span>

          <span className="text-muted-foreground">Hired</span>
          <span>{new Date(user.createdDate).toISOString().slice(0, 10)}</span>
        </div>
      </div>
    </div>
  );
}
