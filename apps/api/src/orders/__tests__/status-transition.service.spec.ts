import { StatusTransitionService } from "@orders/status-transition.service";
import { InvalidStatusTransitionError } from "@orders/errors/invalid-status-transition.error";
import type { OrderStatusRepository } from "@orders/order-status.repository";
import type { OrderEventEmitterService } from "@orders/order-event-emitter.service";
import { StoreId } from "@shared/value-objects/store-id";
import { OrderId } from "@shared/value-objects/order-id";
import { FAKE_STORE_ID, FAKE_CREATED_ORDER_ID, createFakeCreatedOrder } from "./fixtures";

const fakeStoreId = StoreId.create(FAKE_STORE_ID);
const fakeOrderId = OrderId.create(FAKE_CREATED_ORDER_ID);

function createMockEmitter(): jest.Mocked<OrderEventEmitterService> {
  return {
    emitStatusUpdated: jest.fn(),
  } as unknown as jest.Mocked<OrderEventEmitterService>;
}

describe("StatusTransitionService", () => {
  const fakeOrder = createFakeCreatedOrder();
  const confirmedOrder = { ...fakeOrder, status: "CONFIRMED" as const };

  const mockRepository = {
    findById: jest.fn().mockResolvedValue(fakeOrder),
    transitionStatus: jest.fn().mockResolvedValue(confirmedOrder),
  } as unknown as jest.Mocked<OrderStatusRepository>;

  const mockEmitter = createMockEmitter();
  const service = new StatusTransitionService(mockRepository, mockEmitter);

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

    const rejectedService = new StatusTransitionService(mockRepository, createMockEmitter());

    await expect(
      rejectedService.transition(fakeStoreId, fakeOrderId, "PLACED"),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it("should throw when order is not found", async () => {
    mockRepository.findById = jest.fn().mockResolvedValue(undefined);
    const nonexistentOrderId = OrderId.create("nonexistent-id");

    const notFoundService = new StatusTransitionService(mockRepository, createMockEmitter());

    await expect(
      notFoundService.transition(fakeStoreId, nonexistentOrderId, "CONFIRMED"),
    ).rejects.toThrow("Order nonexistent-id not found");
  });

  it("should allow transition to CANCELLED from any active status", async () => {
    mockRepository.findById = jest.fn().mockResolvedValue(fakeOrder);
    mockRepository.transitionStatus = jest.fn().mockResolvedValue({ ...fakeOrder, status: "CANCELLED" });

    const cancelService = new StatusTransitionService(mockRepository, createMockEmitter());
    const result = await cancelService.transition(fakeStoreId, fakeOrderId, "CANCELLED");

    expect(result.status).toBe("CANCELLED");
  });

  it("should emit order_status_updated after successful transition", async () => {
    mockRepository.findById = jest.fn().mockResolvedValue(fakeOrder);
    mockRepository.transitionStatus = jest.fn().mockResolvedValue(confirmedOrder);
    const emitter = createMockEmitter();
    const emitService = new StatusTransitionService(mockRepository, emitter);

    await emitService.transition(fakeStoreId, fakeOrderId, "CONFIRMED");

    expect(emitter.emitStatusUpdated).toHaveBeenCalledWith(confirmedOrder);
  });

  it("should not emit when transition is rejected", async () => {
    const concludedOrder = { ...fakeOrder, status: "CONCLUDED" as const };
    mockRepository.findById = jest.fn().mockResolvedValue(concludedOrder);
    const emitter = createMockEmitter();
    const rejectedService = new StatusTransitionService(mockRepository, emitter);

    await expect(
      rejectedService.transition(fakeStoreId, fakeOrderId, "PLACED"),
    ).rejects.toThrow(InvalidStatusTransitionError);
    expect(emitter.emitStatusUpdated).not.toHaveBeenCalled();
  });
});
