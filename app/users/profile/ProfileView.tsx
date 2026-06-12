import getUser from '@/app/libs/getUser';
import AvatarSection from '@/components/AvatarSection';
import EditProfileDialog from '@/components/EditProfileDialog';

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

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <AvatarSection
          userId={user.id}
          initialAvatarUrl={user.avatar}
          login={user.login}
          firstName={user.firstName}
          lastName={user.lastName}
        />
        <div className="w-full rounded-lg border p-6 space-y-4 lg:w-80">
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
            <span className="text-muted-foreground">Created</span>
            <p>{new Date(user.createdDate).toISOString().slice(0, 10)}</p>
          </div>

          <EditProfileDialog
            userId={user.id}
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            phone={user.phone}
            role={user.role}
          />
        </div>
      </div>
    </div>
  );
}
