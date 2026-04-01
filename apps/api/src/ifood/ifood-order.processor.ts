import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { IFoodOrderClient } from "./ifood-order-client";
import { IFoodEventRepository } from "./ifood-event.repository";
import { IFoodOrderId } from "./value-objects/ifood-order-id";
import { IFoodEventId } from "./value-objects/ifood-event-id";
import { StoreId } from "./value-objects/store-id";
import { IFOOD_EVENT_QUEUE, IFOOD_PLACED_EVENT_CODE } from "./ifood.constants";
import type { ProcessIFoodEventJobData } from "./ifood.types";

@Processor(IFOOD_EVENT_QUEUE)
export class IFoodOrderProcessor extends WorkerHost {
  private readonly logger = new Logger(IFoodOrderProcessor.name);

  constructor(
    private readonly orderClient: IFoodOrderClient,
    private readonly eventRepository: IFoodEventRepository,
  ) {
    super();
  }

  async process(job: Job<ProcessIFoodEventJobData>): Promise<void> {
    if (!this.isPlacedEvent(job.data)) return this.skipNonPlacedEvent(job.data);
    await this.processPlacedEvent(job.data);
  }

  private isPlacedEvent(data: ProcessIFoodEventJobData): boolean {
    return data.eventType.includes(IFOOD_PLACED_EVENT_CODE);
  }

  private skipNonPlacedEvent(data: ProcessIFoodEventJobData): void {
    this.logger.log(`Skipping non-PLACED event ${data.eventId} (type: ${data.eventType})`);
  }

  private async processPlacedEvent(data: ProcessIFoodEventJobData): Promise<void> {
    const orderId = IFoodOrderId.create(data.orderId);
    const storeId = StoreId.create(data.storeId);
    const eventId = IFoodEventId.create(data.eventId);
    await this.orderClient.fetchOrderDetails(orderId);
    await this.eventRepository.markAsProcessed(storeId, eventId);
    this.logger.log(`Processed PLACED event ${data.eventId} for order ${data.orderId}`);
  }
}
