import { Resolver, Query, Authorized, Ctx } from 'type-graphql';
import { db } from '@/app/db/db';
import {
  Order,
  Engineer,
  Part,
  EngineerStock,
  Invoice,
  DashboardStats,
  OrderStatus,
  PaymentStatus,
} from '@/app/db/entities';
import type { Context } from '@/server/context';

@Resolver()
export class DashboardResolver {
  private orderRepo = db.getRepository(Order);
  private engineerRepo = db.getRepository(Engineer);
  private partRepo = db.getRepository(Part);
  private stockRepo = db.getRepository(EngineerStock);
  private invoiceRepo = db.getRepository(Invoice);

  @Authorized()
  @Query(() => DashboardStats)
  async dashboardStats(@Ctx() ctx: Context): Promise<DashboardStats> {
    const [
      totalOrders,
      unpaidInvoices,
      totalEngineers,
      activeEngineers,
      totalParts,
      statusRows,
    ] = await Promise.all([
      this.orderRepo.count(),
      this.invoiceRepo.count({
        where: { paymentStatus: PaymentStatus.UNPAID },
      }),
      this.engineerRepo.count(),
      this.engineerRepo.count({ where: { isActive: true } }),
      this.partRepo.count(),
      this.orderRepo
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany<{ status: OrderStatus; count: string }>(),
    ]);

    const counts = new Map(
      statusRows.map((row) => [row.status, Number(row.count)]),
    );
    const ordersByStatus = Object.values(OrderStatus).map((status) => ({
      status,
      count: counts.get(status) ?? 0,
    }));

    let lowStockParts: number | undefined;
    if (ctx.role === 'manager' || ctx.role === 'admin') {
      const stock = await this.stockRepo.find();
      lowStockParts = stock.filter((s) => s.quantity < s.minQuantity).length;
    }

    return {
      totalOrders,
      ordersByStatus,
      unpaidInvoices,
      totalEngineers,
      activeEngineers,
      totalParts,
      lowStockParts,
    };
  }
}
