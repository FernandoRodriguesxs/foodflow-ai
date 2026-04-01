import type { MerchantId } from "@ifood/value-objects/merchant-id";
import type { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import type { IFoodOrderId } from "@ifood/value-objects/ifood-order-id";

export interface IFoodWebhookEventPayload {
  readonly id: string;
  readonly code: string;
  readonly fullCode: string;
  readonly merchantId: string;
  readonly orderId: string;
  readonly createdAt: string;
}

export interface IFoodWebhookEvent {
  readonly eventId: IFoodEventId;
  readonly merchantId: MerchantId;
  readonly orderId: IFoodOrderId;
  readonly eventType: string;
  readonly payload: IFoodWebhookEventPayload;
}

export interface ProcessIFoodEventJobData {
  readonly eventId: string;
  readonly storeId: string;
  readonly orderId: string;
  readonly eventType: string;
}

export interface IFoodOAuthTokenResponse {
  readonly accessToken: string;
  readonly expiresIn: number;
}
