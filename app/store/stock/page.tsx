import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import getEngineerStock from '@/app/libs/getEngineerStock';
import getEngineers from '@/app/libs/getEngineers';
import getParts from '@/app/libs/getParts';
import StoreNav from '../StoreNav';
import StockTable from './StockTable';

export default async function StockPage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canManage = role === 'admin' || role === 'manager';

  if (!canManage) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Store</h1>
        <StoreNav canManage={canManage} />
        <p className="text-muted-foreground">
          You don&apos;t have access to this page.
        </p>
      </div>
    );
  }

  const [{ data, error }, { data: engineersData }, { data: partsData }] =
    await Promise.all([
      getEngineerStock(),
      getEngineers({ isActive: true }, { limit: 100, offset: 0 }),
      getParts(undefined, { limit: 100, offset: 0 }),
    ]);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  const stock = data?.engineerStock ?? [];
  const engineers = engineersData?.engineers.items ?? [];
  const parts = partsData?.parts.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Store</h1>

      <StoreNav canManage={canManage} />

      <StockTable stock={stock} engineers={engineers} parts={parts} />
    </div>
  );
}
