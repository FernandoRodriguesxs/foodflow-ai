import { OrderListingRepository } from "../order-listing.repository";
import type { TenantDatabaseService } from "@tenant/tenant-database.service";
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

describe("OrderListingRepository", () => {
  const fakeOrder = createFakeCreatedOrder();

  const mockOffset = jest.fn().mockResolvedValue([fakeOrder]);
  const mockLimit = jest.fn().mockReturnValue({ offset: mockOffset });
  const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockListWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
  const mockListFrom = jest.fn().mockReturnValue({
    where: mockListWhere,
    orderBy: mockOrderBy,
  });
  const mockCountFrom = jest.fn();
  const mockSelect = jest.fn().mockImplementation((columns?: { value?: unknown }) =>
    columns?.value ? { from: mockCountFrom } : { from: mockListFrom },
  );

  const mockDb = { select: mockSelect };

  const mockTenantDatabase: jest.Mocked<TenantDatabaseService> = {
    executeWithTenant: jest
      .fn()
      .mockImplementation((_storeId, operation) => operation(mockDb)),
  } as any;

  const repository = new OrderListingRepository(mockTenantDatabase);
  const storeId = StoreId.create(FAKE_STORE_ID);

  beforeEach(() => {
    jest.clearAllMocks();
    mockCountFrom.mockReturnValue({
      where: jest.fn().mockResolvedValue([{ value: 1 }]),
      then: (resolve: (value: { value: number }[]) => unknown) => resolve([{ value: 1 }]),
    });
  });

  it("should execute within tenant context", async () => {
    await repository.listOrders(storeId, buildFilters());

    expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(
      FAKE_STORE_ID,
      expect.any(Function),
    );
  });

  it("should apply pagination with limit and offset", async () => {
    await repository.listOrders(storeId, buildFilters({ page: 3, limit: 10 }));

    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockOffset).toHaveBeenCalledWith(20);
  });

  it("should skip where clause when no filters are provided", async () => {
    await repository.listOrders(storeId, buildFilters());

    expect(mockListWhere).not.toHaveBeenCalled();
  });

  it("should apply where clause when statuses are provided", async () => {
    await repository.listOrders(storeId, buildFilters({ statuses: ["PLACED"] }));

    expect(mockListWhere).toHaveBeenCalledTimes(1);
  });

  it("should return data and total from query results", async () => {
    const result = await repository.listOrders(storeId, buildFilters());

    expect(result.data).toEqual([fakeOrder]);
    expect(result.total).toBe(1);
  });
});
