import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import getParts from '@/app/libs/getParts';
import { columns } from './columns';
import { DataTable } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import CreatePartDialog from '@/components/CreatePartDialog';
import StoreNav from './StoreNav';

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export default async function StorePage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const offset = (page - 1) * limit;

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canManage = role === 'admin' || role === 'manager';

  const { data, error } = await getParts(undefined, { limit, offset });

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  const parts = data?.parts.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Store{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({data?.parts.total ?? 0})
          </span>
        </h1>
        {canManage && <CreatePartDialog />}
      </div>

      <StoreNav canManage={canManage} />

      <DataTable
        columns={columns}
        data={parts}
        emptyMessage="No parts found."
      />

      <Pagination limit={limit} page={page} total={data?.parts.total ?? 0} />
    </div>
  );
}
