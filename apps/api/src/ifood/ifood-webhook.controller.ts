import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { IFoodWebhookService } from "./ifood-webhook.service";
import { createWebhookEvent } from "./ifood-webhook-event.factory";
import type { IFoodWebhookEventPayload } from "./ifood.types";

@Controller("api/webhooks/ifood")
export class IFoodWebhookController {
  constructor(private readonly webhookService: IFoodWebhookService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async receiveEvent(@Body() payload: IFoodWebhookEventPayload): Promise<void> {
    const event = createWebhookEvent(payload);
    await this.webhookService.processWebhookEvent(event);
  }
}
