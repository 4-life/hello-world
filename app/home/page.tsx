import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {
  ClipboardList,
  HardHat,
  Warehouse,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import getDashboardStats from '@/app/libs/getDashboardStats';
import { formatLabel, orderStatusVariant } from '@/app/orders/statusBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href: string;
  accentClassName: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  accentClassName,
}: StatCardProps): React.JSX.Element {
  return (
    <Link href={href}>
      <Card
        className={cn(
          'border-b-4 transition-colors hover:bg-accent/50',
          accentClassName,
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Icon className="size-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const [session, { data, error }] = await Promise.all([
    getServerSession(authOptions),
    getDashboardStats(),
  ]);

  if (error || !data) {
    return (
      <p className="p-6 text-destructive">
        {error?.message ?? 'Failed to load dashboard'}
      </p>
    );
  }

  const stats = data.dashboardStats;
  const name = session?.user?.name ?? 'there';

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Hello, {name}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total orders"
          value={stats.totalOrders}
          icon={ClipboardList}
          href="/orders"
          accentClassName="border-b-blue-500"
        />
        <StatCard
          title="Unpaid invoices"
          value={stats.unpaidInvoices}
          icon={Wallet}
          href="/invoices?paymentStatus=UNPAID"
          accentClassName="border-b-red-500"
        />
        <StatCard
          title="Active engineers"
          value={stats.activeEngineers}
          icon={HardHat}
          href="/engineers"
          accentClassName="border-b-green-500"
        />
        <StatCard
          title="Parts in catalog"
          value={stats.totalParts}
          icon={Warehouse}
          href="/store"
          accentClassName="border-b-violet-500"
        />
        {stats.lowStockParts !== undefined && (
          <StatCard
            title="Low stock items"
            value={stats.lowStockParts}
            icon={AlertTriangle}
            href="/store"
            accentClassName="border-b-amber-500"
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders by status</CardTitle>
          <CardDescription>Current breakdown of all orders</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {stats.ordersByStatus.map((item) => (
            <Link
              key={item.status}
              href={`/orders?status=${item.status}`}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent"
            >
              <Badge variant={orderStatusVariant(item.status)}>
                {formatLabel(item.status)}
              </Badge>
              <span className="font-medium">{item.count}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
