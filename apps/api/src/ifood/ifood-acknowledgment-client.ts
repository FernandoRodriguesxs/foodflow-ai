import { Injectable } from "@nestjs/common";
import { IFoodHttpClient } from "./ifood-http-client";
import type { IFoodEventId } from "@ifood/value-objects/ifood-event-id";

const ACKNOWLEDGMENT_PATH = "/events/v1.0/events/acknowledgment";

@Injectable()
export class IFoodAcknowledgmentClient {
  constructor(private readonly httpClient: IFoodHttpClient) {}

  async acknowledgeEvents(eventIds: ReadonlyArray<IFoodEventId>): Promise<void> {
    if (eventIds.length === 0) return;
    const rawIds = eventIds.map((eventId) => eventId.value);
    await this.httpClient.authenticatedPost(ACKNOWLEDGMENT_PATH, rawIds);
  }
}
