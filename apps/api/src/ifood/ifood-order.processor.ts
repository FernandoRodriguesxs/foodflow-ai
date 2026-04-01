import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { OrderNormalizerService } from "@orders/order-normalizer.service";
import { IFoodOrderClient } from "./ifood-order-client";
import { IFoodEventRepository } from "./ifood-event.repository";
import { extractNormalizedOrder } from "./ifood-order-data-extractor";
import { IFoodOrderId } from "@ifood/value-objects/ifood-order-id";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import { StoreId } from "@ifood/value-objects/store-id";
import { IFOOD_EVENT_QUEUE, IFOOD_PLACED_EVENT_CODE } from "./ifood.constants";
import type { ProcessIFoodEventJobData } from "./ifood.types";

@Processor(IFOOD_EVENT_QUEUE)
export class IFoodOrderProcessor extends WorkerHost {
  private readonly logger = new Logger(IFoodOrderProcessor.name);

  constructor(
    private readonly orderClient: IFoodOrderClient,
    private readonly eventRepository: IFoodEventRepository,
    private readonly orderNormalizer: OrderNormalizerService,
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
    const orderDetails = await this.orderClient.fetchOrderDetails(orderId);
    const normalizedOrder = extractNormalizedOrder(storeId, orderDetails);
    await this.orderNormalizer.normalizeIFoodOrder(normalizedOrder);
    await this.eventRepository.markAsProcessed(storeId, eventId);
    this.logger.log(`Processed PLACED event ${data.eventId} for order ${data.orderId}`);
  }
}
