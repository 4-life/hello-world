import getEngineers from '@/app/libs/getEngineers';
import { EngineerSortField, SortOrder } from '@/app/db/entities';
import { columns } from './columns';
import { DataTable } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import EngineersFilters from './EngineersFilters';
import CreateEngineerDialog from '@/components/CreateEngineerDialog';

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    query?: string;
    isActive?: string;
    sortField?: string;
    sortOrder?: string;
  }>;
};

export default async function EngineersPage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = params.query;
  const isActive =
    params.isActive === 'true'
      ? true
      : params.isActive === 'false'
        ? false
        : undefined;
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const offset = (page - 1) * limit;

  const sortField =
    params.sortField && params.sortField in EngineerSortField
      ? (params.sortField as EngineerSortField)
      : undefined;
  const sortOrder =
    params.sortOrder === 'DESC' ? SortOrder.DESC : SortOrder.ASC;
  const sort = sortField ? { field: sortField, order: sortOrder } : undefined;

  const { data, error } = await getEngineers(
    { query, isActive },
    { limit, offset },
    sort,
  );

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  const engineers = data?.engineers.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Engineers{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({data?.engineers.total ?? 0})
          </span>
        </h1>
        <CreateEngineerDialog />
      </div>

      <EngineersFilters />

      <DataTable
        columns={columns}
        data={engineers}
        emptyMessage="No engineers found."
      />

      <Pagination
        limit={limit}
        page={page}
        total={data?.engineers.total ?? 0}
      />
    </div>
  );
}
