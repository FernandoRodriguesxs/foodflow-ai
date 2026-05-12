import { OrderEventEmitterService } from "@orders/order-event-emitter.service";
import { DASHBOARD_EVENTS } from "@dashboard/dashboard.constants";
import type { DashboardGateway } from "@dashboard/dashboard.gateway";
import { createFakeCreatedOrder, FAKE_STORE_ID } from "./fixtures";

describe("OrderEventEmitterService", () => {
  const mockGateway = {
    broadcastToStore: jest.fn(),
  } as unknown as jest.Mocked<DashboardGateway>;

  const emitter = new OrderEventEmitterService(mockGateway);

  afterEach(() => jest.clearAllMocks());

  it("should broadcast new_order with full order to store room", () => {
    const order = createFakeCreatedOrder();

    emitter.emitNewOrder(order);

    expect(mockGateway.broadcastToStore).toHaveBeenCalledWith(
      FAKE_STORE_ID,
      DASHBOARD_EVENTS.NEW_ORDER,
      order,
    );
  });

  it("should broadcast order_status_updated with id and status payload", () => {
    const order = createFakeCreatedOrder();

    emitter.emitStatusUpdated(order);

    expect(mockGateway.broadcastToStore).toHaveBeenCalledWith(
      FAKE_STORE_ID,
      DASHBOARD_EVENTS.ORDER_STATUS_UPDATED,
      { id: order.id, status: order.status },
    );
  });
});
