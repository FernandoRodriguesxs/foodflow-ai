import { IFoodOrderClient } from "@ifood/ifood-order-client";
import type { IFoodHttpClient } from "@ifood/ifood-http-client";
import { IFoodOrderId } from "@ifood/value-objects/ifood-order-id";
import { createFakeIFoodOrderDetails } from "./fixtures";

describe("IFoodOrderClient", () => {
  const mockHttpClient = {
    authenticatedGet: jest.fn(),
  } as unknown as jest.Mocked<IFoodHttpClient>;

  const client = new IFoodOrderClient(mockHttpClient);

  afterEach(() => jest.clearAllMocks());

  it("should fetch order details from order endpoint", async () => {
    const orderId = IFoodOrderId.create("order-uuid-012");
    const fakeOrder = createFakeIFoodOrderDetails();
    mockHttpClient.authenticatedGet.mockResolvedValueOnce({
      json: async () => fakeOrder,
    } as unknown as Response);

    const result = await client.fetchOrderDetails(orderId);

    expect(result).toEqual(fakeOrder);
    expect(mockHttpClient.authenticatedGet).toHaveBeenCalledWith(
      "/order/v1.0/orders/order-uuid-012",
    );
  });
});
