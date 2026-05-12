import { OrderListingService } from "../order-listing.service";
import type { OrderListingRepository } from "../order-listing.repository";
import { StoreId } from "@shared/value-objects/store-id";
import { createFakeCreatedOrder, FAKE_STORE_ID } from "./fixtures";
import type { OrderListFilters } from "../order-list.types";

function buildFilters(overrides?: Partial<OrderListFilters>): OrderListFilters {
  return Object.freeze({
    statuses: [],
    source: undefined,
    page: 1,
    limit: 20,
    ...overrides,
  });
}

describe("OrderListingService", () => {
  const storeId = StoreId.create(FAKE_STORE_ID);

  const buildRepoMock = (total: number) =>
    ({
      listOrders: jest.fn().mockResolvedValue({
        data: total === 0 ? [] : [createFakeCreatedOrder()],
        total,
      }),
    }) as unknown as jest.Mocked<OrderListingRepository>;

  it("should compute totalPages using ceil division", async () => {
    const service = new OrderListingService(buildRepoMock(45));

    const result = await service.listOrders(storeId, buildFilters({ limit: 20 }));

    expect(result.meta.total).toBe(45);
    expect(result.meta.totalPages).toBe(3);
  });

  it("should return totalPages zero when there are no orders", async () => {
    const service = new OrderListingService(buildRepoMock(0));

    const result = await service.listOrders(storeId, buildFilters());

    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it("should pass through filters page and limit in meta", async () => {
    const service = new OrderListingService(buildRepoMock(10));

    const result = await service.listOrders(storeId, buildFilters({ page: 2, limit: 5 }));

    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(5);
  });

  it("should return a frozen result", async () => {
    const service = new OrderListingService(buildRepoMock(1));

    const result = await service.listOrders(storeId, buildFilters());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.meta)).toBe(true);
  });
});
