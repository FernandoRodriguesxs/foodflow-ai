import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { IFoodPollingClient } from "./ifood-polling-client";
import { IFoodEventDeduplicator } from "./ifood-event-deduplicator";
import { IFoodWebhookService } from "./ifood-webhook.service";
import { createWebhookEvent } from "./ifood-webhook-event.factory";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import { IFOOD_POLLING_QUEUE } from "./ifood.constants";
import type { IFoodWebhookEventPayload } from "./ifood.types";

@Processor(IFOOD_POLLING_QUEUE)
export class IFoodPollingProcessor extends WorkerHost {
  private readonly logger = new Logger(IFoodPollingProcessor.name);

  constructor(
    private readonly pollingClient: IFoodPollingClient,
    private readonly deduplicator: IFoodEventDeduplicator,
    private readonly webhookService: IFoodWebhookService,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const events = await this.pollingClient.fetchEvents();
    await this.pollingClient.acknowledgeEvents(events.map((event) => IFoodEventId.create(event.id)));
    const newEvents = await this.deduplicator.filterNewEvents(events);
    this.logger.log(`Polled ${events.length} events, ${newEvents.length} new`);
    await this.processNewEvents(newEvents);
  }

  private async processNewEvents(
    events: ReadonlyArray<IFoodWebhookEventPayload>,
  ): Promise<void> {
    const results = await Promise.allSettled(
      events.map((payload) => this.processSingleEvent(payload)),
    );
    this.logRejectedResults(results);
  }

  private async processSingleEvent(payload: IFoodWebhookEventPayload): Promise<void> {
    const event = createWebhookEvent(payload);
    await this.webhookService.processWebhookEvent(event);
  }

  private logRejectedResults(results: PromiseSettledResult<void>[]): void {
    for (const result of results) {
      if (result.status !== "rejected") continue;
      this.logger.error(`Failed to process polling event: ${result.reason}`);
    }
  }
}
