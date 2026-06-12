import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import getOrder from '@/app/libs/getOrder';
import getEngineers from '@/app/libs/getEngineers';
import BackButton from '@/components/BackButton';
import OrderDetail from './OrderDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;

  const [session, { data, error }, { data: engineersData }] = await Promise.all(
    [
      getServerSession(authOptions),
      getOrder(id),
      getEngineers({ isActive: true }, { limit: 100, offset: 0 }),
    ],
  );

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  if (!data?.order) {
    notFound();
  }

  const engineers = engineersData?.engineers.items ?? [];
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canManage = role === 'admin' || role === 'manager';

  return (
    <div className="max-w-2xl p-6">
      <BackButton href="/orders" label="Back to orders" />

      <h1 className="mb-6 text-2xl font-semibold">
        Order #{data.order.orderNumber}
      </h1>

      <OrderDetail
        order={data.order}
        engineers={engineers}
        canManage={canManage}
      />
    </div>
  );
}
