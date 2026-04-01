import { extractNormalizedOrder } from "@ifood/ifood-order-data-extractor";
import { StoreId } from "@ifood/value-objects/store-id";
import { createFakeIFoodOrderDetails, FAKE_STORE_ID } from "./fixtures";

describe("extractNormalizedOrder", () => {
  const storeId = StoreId.create(FAKE_STORE_ID);

  it("should extract customer, items and total from order details", () => {
    const orderDetails = createFakeIFoodOrderDetails();

    const result = extractNormalizedOrder(storeId, orderDetails);

    expect(result.storeId).toBe(FAKE_STORE_ID);
    expect(result.externalId).toBe(orderDetails.id);
    expect(result.customerName).toBe("Maria Silva");
    expect(result.customerPhone).toBe("11999998888");
    expect(result.total).toBe(61);
  });

  it("should extract all order items with correct fields", () => {
    const orderDetails = createFakeIFoodOrderDetails();

    const result = extractNormalizedOrder(storeId, orderDetails);

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      name: "Pizza Margherita",
      quantity: 2,
      unitPrice: 25.5,
      notes: "Extra cheese",
    });
    expect(result.items[1]).toEqual({
      name: "Coca-Cola 350ml",
      quantity: 1,
      unitPrice: 10,
      notes: undefined,
    });
  });

  it("should include raw data for audit trail", () => {
    const orderDetails = createFakeIFoodOrderDetails();

    const result = extractNormalizedOrder(storeId, orderDetails);

    expect(result.rawData).toEqual(orderDetails);
  });

  it("should return a frozen object", () => {
    const orderDetails = createFakeIFoodOrderDetails();

    const result = extractNormalizedOrder(storeId, orderDetails);

    expect(Object.isFrozen(result)).toBe(true);
  });
});
