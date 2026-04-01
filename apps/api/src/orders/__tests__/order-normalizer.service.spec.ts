import { OrderNormalizerService } from "@orders/order-normalizer.service";
import type { OrderRepository } from "@orders/order.repository";
import { IFOOD_ORDER_SOURCE } from "@orders/orders.constants";
import {
  FAKE_STORE_ID,
  createFakeRawOrderData,
  createFakeCreatedOrder,
} from "./fixtures";

describe("OrderNormalizerService", () => {
  const fakeCreatedOrder = createFakeCreatedOrder();

  const mockOrderRepository = {
    saveOrder: jest.fn().mockResolvedValue(fakeCreatedOrder),
  } as unknown as jest.Mocked<OrderRepository>;

  const normalizerService = new OrderNormalizerService(mockOrderRepository);

  afterEach(() => jest.clearAllMocks());

  it("should save iFood order with source 'ifood'", async () => {
    const rawOrder = createFakeRawOrderData();

    await normalizerService.normalizeIFoodOrder(rawOrder);

    expect(mockOrderRepository.saveOrder).toHaveBeenCalledWith(
      expect.objectContaining({ source: IFOOD_ORDER_SOURCE }),
    );
  });

  it("should pass all raw order fields to repository", async () => {
    const rawOrder = createFakeRawOrderData();

    await normalizerService.normalizeIFoodOrder(rawOrder);

    expect(mockOrderRepository.saveOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: FAKE_STORE_ID,
        externalId: rawOrder.externalId,
        customerName: "Maria Silva",
        customerPhone: "11999998888",
        total: 61,
        items: rawOrder.items,
      }),
    );
  });

  it("should return the created order from repository", async () => {
    const rawOrder = createFakeRawOrderData();

    const result = await normalizerService.normalizeIFoodOrder(rawOrder);

    expect(result).toEqual(fakeCreatedOrder);
  });

  it("should pass a frozen order data object to repository", async () => {
    const rawOrder = createFakeRawOrderData();

    await normalizerService.normalizeIFoodOrder(rawOrder);

    const savedData = mockOrderRepository.saveOrder.mock.calls[0][0];
    expect(Object.isFrozen(savedData)).toBe(true);
  });
});
