import { Injectable, Logger } from "@nestjs/common";
import { IFoodAcknowledgmentClient } from "./ifood-acknowledgment-client";
import { IFoodEventRepository } from "./ifood-event.repository";
import type { StoreId } from "@ifood/value-objects/store-id";
import type { IFoodEventId } from "./value-objects/ifood-event-id";

@Injectable()
export class IFoodAcknowledgmentService {
  private readonly logger = new Logger(IFoodAcknowledgmentService.name);

  constructor(
    private readonly acknowledgmentClient: IFoodAcknowledgmentClient,
    private readonly eventRepository: IFoodEventRepository,
  ) {}

  async acknowledgeEvents(storeId: StoreId, eventIds: ReadonlyArray<IFoodEventId>): Promise<void> {
    if (eventIds.length === 0) return;
    await this.acknowledgmentClient.acknowledgeEvents(eventIds);
    await this.eventRepository.markAsAcknowledged(storeId, eventIds);
    this.logger.log(`Acknowledged ${eventIds.length} events for store ${storeId.value}`);
  }
}
