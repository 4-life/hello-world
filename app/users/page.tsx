import getUsers from '@/app/libs/getUsers';
import { UserRole } from '@/app/db/entities/UserRole';
import { UserSortField, SortOrder } from '@/app/db/entities';
import { columns } from './columns';
import { DataTable } from './data-table';
import Pagination from '@/components/Pagination';
import Filters from '@/components/Filters';

type Props = {
  searchParams: {
    page?: string;
    limit?: string;
    role?: UserRole;
    email?: string;
    sortField?: string;
    sortOrder?: string;
  };
};

export default async function UsersPage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const params = await searchParams;
  const role = params.role;
  const email = params.email;
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const offset = (page - 1) * limit;

  const sortField =
    params.sortField && params.sortField in UserSortField
      ? (params.sortField as UserSortField)
      : undefined;
  const sortOrder =
    params.sortOrder === 'DESC' ? SortOrder.DESC : SortOrder.ASC;
  const sort = sortField ? { field: sortField, order: sortOrder } : undefined;

  const { data, error } = await getUsers(
    { role, email },
    { limit, offset },
    sort,
  );

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  const users = data?.users.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">
        Users{' '}
        <span className="text-sm font-normal text-muted-foreground">
          ({data?.users.total ?? 0})
        </span>
      </h1>

      <Filters />

      <DataTable columns={columns} data={users} />

      <Pagination limit={limit} page={page} total={data?.users.total ?? 0} />
    </div>
  );
}
