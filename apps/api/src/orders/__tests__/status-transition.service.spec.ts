import { StatusTransitionService } from "@orders/status-transition.service";
import { InvalidStatusTransitionError } from "@orders/errors/invalid-status-transition.error";
import type { OrderStatusRepository } from "@orders/order-status.repository";
import { StoreId } from "@shared/value-objects/store-id";
import { OrderId } from "@shared/value-objects/order-id";
import { FAKE_STORE_ID, FAKE_CREATED_ORDER_ID, createFakeCreatedOrder } from "./fixtures";

const fakeStoreId = StoreId.create(FAKE_STORE_ID);
const fakeOrderId = OrderId.create(FAKE_CREATED_ORDER_ID);

describe("StatusTransitionService", () => {
  const fakeOrder = createFakeCreatedOrder();

  const mockRepository = {
    findById: jest.fn().mockResolvedValue(fakeOrder),
    transitionStatus: jest.fn().mockResolvedValue({ ...fakeOrder, status: "CONFIRMED" }),
  } as unknown as jest.Mocked<OrderStatusRepository>;

  const service = new StatusTransitionService(mockRepository);

  afterEach(() => jest.clearAllMocks());

  it("should transition PLACED to CONFIRMED", async () => {
    const result = await service.transition(fakeStoreId, fakeOrderId, "CONFIRMED");

    expect(result.status).toBe("CONFIRMED");
    expect(mockRepository.transitionStatus).toHaveBeenCalledWith({
      storeId: FAKE_STORE_ID,
      orderId: FAKE_CREATED_ORDER_ID,
      fromStatus: "PLACED",
      toStatus: "CONFIRMED",
    });
  });

  it("should reject CONCLUDED to PLACED with InvalidStatusTransitionError", async () => {
    const concludedOrder = { ...fakeOrder, status: "CONCLUDED" as const };
    mockRepository.findById = jest.fn().mockResolvedValue(concludedOrder);

    const rejectedService = new StatusTransitionService(mockRepository);

    await expect(
      rejectedService.transition(fakeStoreId, fakeOrderId, "PLACED"),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it("should throw when order is not found", async () => {
    mockRepository.findById = jest.fn().mockResolvedValue(undefined);
    const nonexistentOrderId = OrderId.create("nonexistent-id");

    const notFoundService = new StatusTransitionService(mockRepository);

    await expect(
      notFoundService.transition(fakeStoreId, nonexistentOrderId, "CONFIRMED"),
    ).rejects.toThrow("Order nonexistent-id not found");
  });

  it("should allow transition to CANCELLED from any active status", async () => {
    mockRepository.findById = jest.fn().mockResolvedValue(fakeOrder);
    mockRepository.transitionStatus = jest.fn().mockResolvedValue({ ...fakeOrder, status: "CANCELLED" });

    const cancelService = new StatusTransitionService(mockRepository);
    const result = await cancelService.transition(fakeStoreId, fakeOrderId, "CANCELLED");

    expect(result.status).toBe("CANCELLED");
  });
});
