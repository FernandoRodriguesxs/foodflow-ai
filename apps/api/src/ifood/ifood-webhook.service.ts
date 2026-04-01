import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import { IFoodEventRepository } from "./ifood-event.repository";
import { IFoodAcknowledgmentService } from "./ifood-acknowledgment.service";
import { MerchantStoreResolver } from "./merchant-store.resolver";
import { IFOOD_EVENT_QUEUE, PROCESS_IFOOD_EVENT_JOB } from "./ifood.constants";
import type { IFoodWebhookEvent, ProcessIFoodEventJobData } from "./ifood.types";

@Injectable()
export class IFoodWebhookService {
  constructor(
    private readonly eventRepository: IFoodEventRepository,
    private readonly acknowledgmentService: IFoodAcknowledgmentService,
    private readonly merchantResolver: MerchantStoreResolver,
    @InjectQueue(IFOOD_EVENT_QUEUE) private readonly eventQueue: Queue,
  ) {}

  async processWebhookEvent(event: IFoodWebhookEvent): Promise<void> {
    const storeId = await this.merchantResolver.resolveStoreId(event.merchantId);
    await this.eventRepository.saveEvent(storeId, event);
    await this.acknowledgmentService.acknowledgeEvents(storeId, [event.eventId]);
    const jobData: ProcessIFoodEventJobData = { eventId: event.eventId.value, storeId: storeId.value };
    await this.eventQueue.add(PROCESS_IFOOD_EVENT_JOB, jobData);
  }
}
