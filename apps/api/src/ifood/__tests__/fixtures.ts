import { IFoodEventId } from "../value-objects/ifood-event-id";
import { IFoodOrderId } from "../value-objects/ifood-order-id";
import { MerchantId } from "../value-objects/merchant-id";
import { StoreId } from "../value-objects/store-id";
import type {
  IFoodWebhookEvent,
  IFoodWebhookEventPayload,
  IFoodOrderDetails,
  ProcessIFoodEventJobData,
} from "../ifood.types";

export const FAKE_STORE_ID = "store-uuid-123";
export const FAKE_STORE_ID_VO = StoreId.create(FAKE_STORE_ID);
export const FAKE_MERCHANT_ID = "merchant-uuid-456";
export const FAKE_EVENT_ID = "event-uuid-789";
export const FAKE_ORDER_ID = "order-uuid-012";

export function createFakePayload(): IFoodWebhookEventPayload {
  return {
    id: FAKE_EVENT_ID,
    code: "PLC",
    fullCode: "PLACED",
    merchantId: FAKE_MERCHANT_ID,
    orderId: FAKE_ORDER_ID,
    createdAt: "2026-03-31T10:00:00Z",
  };
}

export function createFakeWebhookEvent(): IFoodWebhookEvent {
  const payload = createFakePayload();
  return Object.freeze({
    eventId: IFoodEventId.create(payload.id),
    merchantId: MerchantId.create(payload.merchantId),
    orderId: IFoodOrderId.create(payload.orderId),
    eventType: payload.fullCode,
    payload,
  });
}

export function createFakePollingPayloads(count: number): IFoodWebhookEventPayload[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `polling-event-${index}`,
    code: "PLC",
    fullCode: "PLACED",
    merchantId: FAKE_MERCHANT_ID,
    orderId: `polling-order-${index}`,
    createdAt: "2026-04-01T10:00:00Z",
  }));
}

export function createFakeIFoodOrderDetails(): IFoodOrderDetails {
  return {
    id: FAKE_ORDER_ID,
    createdAt: "2026-04-01T12:00:00Z",
    customer: {
      id: "customer-uuid-001",
      name: "Maria Silva",
      phone: { number: "11999998888" },
    },
    items: [
      {
        id: "item-uuid-001",
        name: "Pizza Margherita",
        quantity: 2,
        unitPrice: 25.5,
        price: 51,
        observations: "Extra cheese",
      },
      {
        id: "item-uuid-002",
        name: "Coca-Cola 350ml",
        quantity: 1,
        unitPrice: 10,
        price: 10,
      },
    ],
    totalPrice: 61,
    subTotal: 61,
    deliveryFee: 0,
  };
}

export function createFakeProcessJobData(
  overrides?: Partial<ProcessIFoodEventJobData>,
): ProcessIFoodEventJobData {
  return {
    eventId: FAKE_EVENT_ID,
    storeId: FAKE_STORE_ID,
    orderId: FAKE_ORDER_ID,
    eventType: "PLACED",
    ...overrides,
  };
}
