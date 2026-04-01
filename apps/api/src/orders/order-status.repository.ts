import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { TenantDatabaseService } from "@tenant/tenant-database.service";
import type { StoreId } from "@shared/value-objects/store-id";
import type { OrderId } from "@shared/value-objects/order-id";
import { orders } from "@database/schemas/orders.schema";
import { orderStatusHistory } from "@database/schemas/order-status-history.schema";
import type { CreatedOrder, StatusTransitionData, StatusValue } from "./orders.types";

@Injectable()
export class OrderStatusRepository {
  constructor(private readonly tenantDatabase: TenantDatabaseService) {}

  async findById(storeId: StoreId, orderId: OrderId): Promise<CreatedOrder | undefined> {
    return this.tenantDatabase.executeWithTenant(storeId.value, async (transaction) => {
      const [order] = await transaction.select().from(orders).where(eq(orders.id, orderId.value));
      return order;
    });
  }

  async transitionStatus(transitionData: StatusTransitionData): Promise<CreatedOrder> {
    return this.tenantDatabase.executeWithTenant(transitionData.storeId, async (transaction) => {
      const updatedOrder = await this.updateStatus(transaction, transitionData);
      await this.insertHistory(transaction, transitionData);
      return updatedOrder;
    });
  }

  private async updateStatus(
    transaction: NeonHttpDatabase,
    transitionData: StatusTransitionData,
  ): Promise<CreatedOrder> {
    const [updated] = await transaction
      .update(orders)
      .set({ status: transitionData.toStatus as StatusValue, updatedAt: new Date() })
      .where(eq(orders.id, transitionData.orderId))
      .returning();
    return updated;
  }

  private async insertHistory(
    transaction: NeonHttpDatabase,
    transitionData: StatusTransitionData,
  ): Promise<void> {
    const { orderId, fromStatus, toStatus } = transitionData;
    await transaction.insert(orderStatusHistory).values({ orderId, fromStatus, toStatus });
  }
}
