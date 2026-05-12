import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { TenantDatabaseService } from "@tenant/tenant-database.service";
import { orders } from "@database/schemas/orders.schema";
import type { StoreId } from "@shared/value-objects/store-id";
import type {
  OrderListFilters,
  OrderListPageData,
} from "./order-list.types";

@Injectable()
export class OrderListingRepository {
  constructor(private readonly tenantDatabase: TenantDatabaseService) {}

  async listOrders(storeId: StoreId, filters: OrderListFilters): Promise<OrderListPageData> {
    return this.tenantDatabase.executeWithTenant(storeId.value, async (database) => {
      const where = buildWhereClause(filters);
      const [data, totalRow] = await Promise.all([
        fetchPage(database, where, filters),
        fetchTotal(database, where),
      ]);
      return Object.freeze({ data, total: totalRow.value });
    });
  }
}

function buildWhereClause(filters: OrderListFilters): SQL | undefined {
  const conditions: SQL[] = [];
  if (filters.statuses.length > 0) {
    conditions.push(inArray(orders.status, [...filters.statuses]));
  }
  if (filters.source) {
    conditions.push(eq(orders.source, filters.source));
  }
  if (conditions.length === 0) {
    return undefined;
  }
  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

async function fetchPage(database: NeonHttpDatabase, where: SQL | undefined, filters: OrderListFilters) {
  const query = database.select().from(orders);
  const filtered = where ? query.where(where) : query;
  return filtered
    .orderBy(desc(orders.createdAt))
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit);
}

async function fetchTotal(database: NeonHttpDatabase, where: SQL | undefined): Promise<{ value: number }> {
  const query = database.select({ value: count() }).from(orders);
  const filtered = where ? query.where(where) : query;
  const [row] = await filtered;
  return { value: Number(row?.value ?? 0) };
}
