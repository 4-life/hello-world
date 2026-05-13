import getUser from '@/app/libs/getUser';
import { calcAvailableDays } from '@/app/libs/vacationDays';
import VacationCalendar from '@/components/VacationCalendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="rounded-lg border p-6 space-y-4 lg:w-80 lg:shrink-0">
          <Avatar className="size-20">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.login} />}
            <AvatarFallback className="text-2xl">
              {[user.firstName, user.lastName]
                .filter(Boolean)
                .map((n) => n![0])
                .join('')
                .toUpperCase() || user.login[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Login</span>
              <p>{user.login}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-xs">First name</span>
              <p>{user.firstName ?? '—'}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-xs">Last name</span>
              <p>{user.lastName ?? '—'}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-xs">Email</span>
              <p>{user.email ?? '—'}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-xs">Phone</span>
              <p>{user.phone ?? '—'}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-xs">Role</span>
              <p className="capitalize">{user.role}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">Hired</span>
            <p>{new Date(user.createdDate).toISOString().slice(0, 10)}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          {availableVacationDays !== null && (
            <div className="rounded-lg border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Available vacation days
              </p>
              <p className="mt-1 text-6xl font-bold">{availableVacationDays}</p>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-lg font-semibold">Vacations</h2>
            <VacationCalendar
              vacations={user.vacations}
              availableDays={availableVacationDays ?? 0}
              userId={userId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
