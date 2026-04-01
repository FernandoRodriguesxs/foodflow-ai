import { OrderStatusRepository } from "@orders/order-status.repository";
import type { TenantDatabaseService } from "@tenant/tenant-database.service";
import { StoreId } from "@shared/value-objects/store-id";
import { OrderId } from "@shared/value-objects/order-id";
import { FAKE_STORE_ID, FAKE_CREATED_ORDER_ID, createFakeCreatedOrder } from "./fixtures";

describe("OrderStatusRepository", () => {
  const fakeOrder = createFakeCreatedOrder();
  const updatedOrder = { ...fakeOrder, status: "CONFIRMED", updatedAt: new Date() };

  const mockReturning = jest.fn().mockResolvedValue([updatedOrder]);
  const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
  const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
  const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });

  const mockSelectWhere = jest.fn().mockResolvedValue([fakeOrder]);
  const mockFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
  const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

  const mockInsertValues = jest.fn().mockResolvedValue(undefined);
  const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });

  const mockTransaction = { select: mockSelect, update: mockUpdate, insert: mockInsert };

  const mockTenantDatabase = {
    executeWithTenant: jest.fn().mockImplementation(
      async (_storeId: string, operation: Function) => operation(mockTransaction),
    ),
  } as unknown as jest.Mocked<TenantDatabaseService>;

  const repository = new OrderStatusRepository(mockTenantDatabase);
  const fakeStoreId = StoreId.create(FAKE_STORE_ID);
  const fakeOrderId = OrderId.create(FAKE_CREATED_ORDER_ID);

  afterEach(() => jest.clearAllMocks());

  describe("findById", () => {
    it("should execute within tenant context", async () => {
      await repository.findById(fakeStoreId, fakeOrderId);

      expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(
        FAKE_STORE_ID,
        expect.any(Function),
      );
    });

    it("should return the order when found", async () => {
      const result = await repository.findById(fakeStoreId, fakeOrderId);

      expect(result).toEqual(fakeOrder);
    });

    it("should return undefined when not found", async () => {
      mockSelectWhere.mockResolvedValueOnce([]);

      const result = await repository.findById(fakeStoreId, OrderId.create("nonexistent"));

      expect(result).toBeUndefined();
    });
  });

  describe("transitionStatus", () => {
    const transitionData = {
      storeId: FAKE_STORE_ID,
      orderId: FAKE_CREATED_ORDER_ID,
      fromStatus: "PLACED",
      toStatus: "CONFIRMED",
    };

    it("should update order status and insert history", async () => {
      const result = await repository.transitionStatus(transitionData);

      expect(result.status).toBe("CONFIRMED");
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it("should execute within tenant context", async () => {
      await repository.transitionStatus(transitionData);

      expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(
        FAKE_STORE_ID,
        expect.any(Function),
      );
    });
  });
});
