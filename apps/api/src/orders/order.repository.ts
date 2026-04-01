import { Injectable } from "@nestjs/common";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { TenantDatabaseService } from "@tenant/tenant-database.service";
import { orders } from "@database/schemas/orders.schema";
import { orderItems } from "@database/schemas/order-items.schema";
import { buildOrderValues, buildItemValues } from "./order-value-builder";
import type { CreateOrderData, CreateOrderItemData, CreatedOrder } from "./orders.types";

@Injectable()
export class OrderRepository {
  constructor(private readonly tenantDatabase: TenantDatabaseService) {}

  async saveOrder(orderData: CreateOrderData): Promise<CreatedOrder> {
    return this.tenantDatabase.executeWithTenant(orderData.storeId, async (transaction) => {
      const createdOrder = await this.insertOrder(transaction, orderData);
      await this.insertItems(transaction, createdOrder.id, orderData.items);
      return createdOrder;
    });
  }

  private async insertOrder(
    transaction: NeonHttpDatabase,
    orderData: CreateOrderData,
  ): Promise<CreatedOrder> {
    const [createdOrder] = await transaction
      .insert(orders)
      .values(buildOrderValues(orderData))
      .returning();
    return createdOrder;
  }

  private async insertItems(
    transaction: NeonHttpDatabase,
    orderId: string,
    items: ReadonlyArray<CreateOrderItemData>,
  ): Promise<void> {
    await transaction
      .insert(orderItems)
      .values(buildItemValues(orderId, items));
  }
}
