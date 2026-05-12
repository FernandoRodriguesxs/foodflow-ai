import { BadRequestException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { OrdersController } from "../orders.controller";
import { InvalidStatusTransitionError } from "../errors/invalid-status-transition.error";
import type { OrderListingService } from "../order-listing.service";
import type { StatusTransitionService } from "../status-transition.service";
import { createFakeCreatedOrder, FAKE_CREATED_ORDER_ID, FAKE_STORE_ID } from "./fixtures";
import type { AuthenticatedUser } from "@auth/auth.types";

function buildRequest(user: AuthenticatedUser): any {
  return { user };
}

describe("OrdersController", () => {
  const fakeOrder = createFakeCreatedOrder();
  const meta = { total: 1, page: 1, limit: 20, totalPages: 1 };

  const mockListingService = {
    listOrders: jest.fn().mockResolvedValue({ data: [fakeOrder], meta }),
  } as unknown as jest.Mocked<OrderListingService>;

  const mockStatusService = {
    transition: jest.fn().mockResolvedValue({ ...fakeOrder, status: "CONFIRMED" }),
  } as unknown as jest.Mocked<StatusTransitionService>;

  const controller = new OrdersController(mockListingService, mockStatusService);
  const authenticatedUser: AuthenticatedUser = Object.freeze({
    userId: "user-1",
    storeId: FAKE_STORE_ID,
    role: "owner",
  });

  afterEach(() => jest.clearAllMocks());

  it("should resolve store id from authenticated user", async () => {
    await controller.list(buildRequest(authenticatedUser), {});

    const [storeId] = mockListingService.listOrders.mock.calls[0];
    expect(storeId.value).toBe(FAKE_STORE_ID);
  });

  it("should forward parsed filters to the listing service", async () => {
    await controller.list(buildRequest(authenticatedUser), {
      status: "PLACED,CONFIRMED",
      source: "ifood",
      page: "2",
      limit: "10",
    });

    const [, filters] = mockListingService.listOrders.mock.calls[0];
    expect(filters).toEqual({
      statuses: ["PLACED", "CONFIRMED"],
      source: "ifood",
      page: 2,
      limit: 10,
    });
  });

  it("should return the listing service result unchanged", async () => {
    const result = await controller.list(buildRequest(authenticatedUser), {});

    expect(result.data).toEqual([fakeOrder]);
    expect(result.meta).toEqual(meta);
  });

  describe("PATCH :id/status", () => {
    it("should call status transition service with parsed inputs", async () => {
      await controller.updateStatus(
        buildRequest(authenticatedUser),
        FAKE_CREATED_ORDER_ID,
        { status: "CONFIRMED" },
      );

      expect(mockStatusService.transition).toHaveBeenCalledTimes(1);
      const [storeId, orderId, toStatus] = mockStatusService.transition.mock.calls[0];
      expect(storeId.value).toBe(FAKE_STORE_ID);
      expect(orderId.value).toBe(FAKE_CREATED_ORDER_ID);
      expect(toStatus).toBe("CONFIRMED");
    });

    it("should return the updated order on success", async () => {
      const result = await controller.updateStatus(
        buildRequest(authenticatedUser),
        FAKE_CREATED_ORDER_ID,
        { status: "CONFIRMED" },
      );

      expect(result.status).toBe("CONFIRMED");
    });

    it("should reject invalid body with BadRequestException", async () => {
      await expect(
        controller.updateStatus(buildRequest(authenticatedUser), FAKE_CREATED_ORDER_ID, { status: "FOO" }),
      ).rejects.toThrow(BadRequestException);
      expect(mockStatusService.transition).not.toHaveBeenCalled();
    });

    it("should propagate NotFoundException from the service", async () => {
      mockStatusService.transition.mockRejectedValueOnce(new NotFoundException("Order not found"));

      await expect(
        controller.updateStatus(buildRequest(authenticatedUser), FAKE_CREATED_ORDER_ID, { status: "CONFIRMED" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should map InvalidStatusTransitionError to UnprocessableEntityException (422)", async () => {
      mockStatusService.transition.mockRejectedValueOnce(
        new InvalidStatusTransitionError("CONCLUDED", "PLACED"),
      );

      await expect(
        controller.updateStatus(buildRequest(authenticatedUser), FAKE_CREATED_ORDER_ID, { status: "PLACED" }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
