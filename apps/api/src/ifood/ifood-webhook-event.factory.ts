import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import { IFoodOrderId } from "@ifood/value-objects/ifood-order-id";
import { MerchantId } from "@ifood/value-objects/merchant-id";
import type { IFoodWebhookEvent, IFoodWebhookEventPayload } from "./ifood.types";

export function createWebhookEvent(payload: IFoodWebhookEventPayload): IFoodWebhookEvent {
  return Object.freeze({
    eventId: IFoodEventId.create(payload.id),
    merchantId: MerchantId.create(payload.merchantId),
    orderId: IFoodOrderId.create(payload.orderId),
    eventType: payload.fullCode,
    payload,
  });
}
