import { OrderRepository } from "@orders/order.repository";
import type { TenantDatabaseService } from "@tenant/tenant-database.service";
import {
  FAKE_STORE_ID,
  FAKE_CREATED_ORDER_ID,
  createFakeCreateOrderData,
  createFakeCreatedOrder,
} from "./fixtures";

describe("OrderRepository", () => {
  const fakeCreatedOrder = createFakeCreatedOrder();

  const mockReturning = jest.fn().mockResolvedValue([fakeCreatedOrder]);
  const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = jest.fn().mockReturnValue({ values: mockValues });

  const mockTransaction = { insert: mockInsert };

  const mockTenantDatabase = {
    executeWithTenant: jest.fn().mockImplementation(
      async (_storeId: string, operation: Function) => operation(mockTransaction),
    ),
  } as unknown as jest.Mocked<TenantDatabaseService>;

  const repository = new OrderRepository(mockTenantDatabase);

  afterEach(() => jest.clearAllMocks());

  it("should execute within tenant context using store ID", async () => {
    const orderData = createFakeCreateOrderData();

    await repository.saveOrder(orderData);

    expect(mockTenantDatabase.executeWithTenant).toHaveBeenCalledWith(
      FAKE_STORE_ID,
      expect.any(Function),
    );
  });

  it("should insert order with correct values", async () => {
    const orderData = createFakeCreateOrderData();

    await repository.saveOrder(orderData);

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: FAKE_STORE_ID,
        externalId: orderData.externalId,
        source: "ifood",
        customerName: "Maria Silva",
        total: "61",
      }),
    );
  });

  it("should insert order items with string unit prices", async () => {
    const orderData = createFakeCreateOrderData();
    const itemMockValues = jest.fn().mockResolvedValue(undefined);
    mockInsert
      .mockReturnValueOnce({ values: mockValues })
      .mockReturnValueOnce({ values: itemMockValues });

    await repository.saveOrder(orderData);

    expect(itemMockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          orderId: FAKE_CREATED_ORDER_ID,
          name: "Pizza Margherita",
          quantity: 2,
          unitPrice: "25.5",
        }),
      ]),
    );
  });

  it("should return the created order", async () => {
    const orderData = createFakeCreateOrderData();

    const result = await repository.saveOrder(orderData);

    expect(result).toEqual(fakeCreatedOrder);
  });
});
