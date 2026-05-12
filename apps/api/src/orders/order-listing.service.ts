import { Injectable } from "@nestjs/common";
import { OrderListingRepository } from "./order-listing.repository";
import type { StoreId } from "@shared/value-objects/store-id";
import type {
  OrderListFilters,
  OrderListMeta,
  OrderListResult,
} from "./order-list.types";

@Injectable()
export class OrderListingService {
  constructor(private readonly repository: OrderListingRepository) {}

  async listOrders(storeId: StoreId, filters: OrderListFilters): Promise<OrderListResult> {
    const page = await this.repository.listOrders(storeId, filters);
    return Object.freeze({
      data: page.data,
      meta: buildMeta(page.total, filters),
    });
  }
}

function buildMeta(total: number, filters: OrderListFilters): OrderListMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.limit);
  return Object.freeze({
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
  });
}
