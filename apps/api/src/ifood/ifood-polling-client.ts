import { Injectable } from "@nestjs/common";
import { IFoodAuthService } from "./ifood-auth.service";
import { getIFoodApiBaseUrl } from "./ifood.constants";
import type { IFoodWebhookEventPayload } from "./ifood.types";

const POLLING_PATH = "/events/v1.0/events:polling";
const POLLING_REQUEST_FAILED = "iFood polling request failed";

@Injectable()
export class IFoodPollingClient {
  constructor(private readonly authService: IFoodAuthService) {}

  async fetchEvents(): Promise<ReadonlyArray<IFoodWebhookEventPayload>> {
    const token = await this.authService.getAccessToken();
    const url = `${getIFoodApiBaseUrl()}${POLLING_PATH}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`${POLLING_REQUEST_FAILED}: ${response.status}`);
    return response.json();
  }
}
