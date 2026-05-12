import { OrdersController } from "../orders.controller";
import type { OrderListingService } from "../order-listing.service";
import { createFakeCreatedOrder, FAKE_STORE_ID } from "./fixtures";
import type { AuthenticatedUser } from "@auth/auth.types";

function buildRequest(user: AuthenticatedUser): any {
  return { user };
}

describe("OrdersController", () => {
  const fakeOrder = createFakeCreatedOrder();
  const meta = { total: 1, page: 1, limit: 20, totalPages: 1 };

  const mockService = {
    listOrders: jest.fn().mockResolvedValue({ data: [fakeOrder], meta }),
  } as unknown as jest.Mocked<OrderListingService>;

  const controller = new OrdersController(mockService);
  const authenticatedUser: AuthenticatedUser = Object.freeze({
    userId: "user-1",
    storeId: FAKE_STORE_ID,
    role: "owner",
  });

  afterEach(() => jest.clearAllMocks());

  it("should resolve store id from authenticated user", async () => {
    await controller.list(buildRequest(authenticatedUser), {});

    const [storeId] = mockService.listOrders.mock.calls[0];
    expect(storeId.value).toBe(FAKE_STORE_ID);
  });

  it("should forward parsed filters to the listing service", async () => {
    await controller.list(buildRequest(authenticatedUser), {
      status: "PLACED,CONFIRMED",
      source: "ifood",
      page: "2",
      limit: "10",
    });

    const [, filters] = mockService.listOrders.mock.calls[0];
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
});
