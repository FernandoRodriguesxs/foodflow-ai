import { IFoodEventId } from "../value-objects/ifood-event-id";
import { IFoodOrderId } from "../value-objects/ifood-order-id";
import { MerchantId } from "../value-objects/merchant-id";
import { StoreId } from "../value-objects/store-id";
import type { IFoodWebhookEvent, IFoodWebhookEventPayload } from "../ifood.types";

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
