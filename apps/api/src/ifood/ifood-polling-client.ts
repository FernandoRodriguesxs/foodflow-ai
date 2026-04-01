import { Injectable } from "@nestjs/common";
import { IFoodHttpClient } from "./ifood-http-client";
import { IFoodAcknowledgmentClient } from "./ifood-acknowledgment-client";
import type { IFoodEventId } from "./value-objects/ifood-event-id";
import type { IFoodWebhookEventPayload } from "./ifood.types";

const POLLING_PATH = "/events/v1.0/events:polling";

@Injectable()
export class IFoodPollingClient {
  constructor(
    private readonly httpClient: IFoodHttpClient,
    private readonly acknowledgmentClient: IFoodAcknowledgmentClient,
  ) {}

  async fetchEvents(): Promise<ReadonlyArray<IFoodWebhookEventPayload>> {
    const response = await this.httpClient.authenticatedGet(POLLING_PATH);
    return response.json();
  }

  async acknowledgeEvents(eventIds: ReadonlyArray<IFoodEventId>): Promise<void> {
    await this.acknowledgmentClient.acknowledgeEvents(eventIds);
  }
}
