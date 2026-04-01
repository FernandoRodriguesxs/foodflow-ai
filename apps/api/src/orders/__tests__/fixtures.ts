import type { RawOrderData, CreateOrderData, CreatedOrder } from "../orders.types";
import { IFOOD_ORDER_SOURCE } from "../orders.constants";

export const FAKE_STORE_ID = "store-uuid-123";
export const FAKE_EXTERNAL_ID = "order-uuid-012";
export const FAKE_CREATED_ORDER_ID = "created-order-uuid-001";

export function createFakeRawOrderData(): RawOrderData {
  return Object.freeze({
    storeId: FAKE_STORE_ID,
    externalId: FAKE_EXTERNAL_ID,
    customerName: "Maria Silva",
    customerPhone: "11999998888",
    total: 61,
    items: [
      Object.freeze({ name: "Pizza Margherita", quantity: 2, unitPrice: 25.5, notes: "Extra cheese" }),
      Object.freeze({ name: "Coca-Cola 350ml", quantity: 1, unitPrice: 10 }),
    ],
    rawData: { id: FAKE_EXTERNAL_ID },
  });
}

export function createFakeCreateOrderData(): CreateOrderData {
  return Object.freeze({
    ...createFakeRawOrderData(),
    source: IFOOD_ORDER_SOURCE,
  });
}

export function createFakeCreatedOrder(): CreatedOrder {
  return {
    id: FAKE_CREATED_ORDER_ID,
    storeId: FAKE_STORE_ID,
    externalId: FAKE_EXTERNAL_ID,
    source: "ifood",
    status: "PLACED",
    customerName: "Maria Silva",
    customerPhone: "11999998888",
    total: "61",
    rawData: { id: FAKE_EXTERNAL_ID },
    notes: null,
    createdAt: new Date("2026-04-01T12:00:00Z"),
    updatedAt: new Date("2026-04-01T12:00:00Z"),
  };
}
