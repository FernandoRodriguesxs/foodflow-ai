import { Injectable } from "@nestjs/common";
import { IFoodAuthService } from "./ifood-auth.service";
import { getIFoodApiBaseUrl } from "./ifood.constants";
import type { IFoodEventId } from "./value-objects/ifood-event-id";

const ACKNOWLEDGMENT_PATH = "/events/v1.0/events/acknowledgment";
const ACKNOWLEDGMENT_REQUEST_FAILED = "iFood acknowledgment request failed";

@Injectable()
export class IFoodAcknowledgmentClient {
  constructor(private readonly authService: IFoodAuthService) {}

  async acknowledgeEvents(eventIds: ReadonlyArray<IFoodEventId>): Promise<void> {
    if (eventIds.length === 0) return;
    const token = await this.authService.getAccessToken();
    const url = `${getIFoodApiBaseUrl()}${ACKNOWLEDGMENT_PATH}`;
    const rawIds = eventIds.map((eventId) => eventId.value);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawIds),
    });
    if (!response.ok) throw new Error(`${ACKNOWLEDGMENT_REQUEST_FAILED}: ${response.status}`);
  }
}
