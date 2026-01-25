import Pagination from '@/components/Pagination';
import Filters from '@/components/Filters';
import getUsers from '@/app/libs/getUsers';
import { UserRole } from '@/app/db/entities/UserRole';
import UserItem from '@/components/UserItem';

type Props = {
  searchParams: {
    page?: string;
    limit?: string;
    role?: UserRole;
  };
};

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = params.role;
  const offset = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 5);

  const { data, error } = await getUsers({ role }, { limit, offset });

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <Filters />

      {data?.users.items.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}

      <Pagination limit={limit} page={offset} total={data?.users.total ?? 0} />
    </div>
  );
}
