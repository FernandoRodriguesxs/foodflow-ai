import { Injectable } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";
import { TenantDatabaseService } from "@tenant/tenant-database.service";
import { ifoodEvents } from "@database/schemas/ifood-events.schema";
import type { StoreId } from "@ifood/value-objects/store-id";
import type { IFoodEventId } from "./value-objects/ifood-event-id";
import type { IFoodWebhookEvent } from "./ifood.types";

@Injectable()
export class IFoodEventRepository {
  constructor(
    private readonly tenantDatabase: TenantDatabaseService,
  ) {}

  async saveEvent(storeId: StoreId, event: IFoodWebhookEvent): Promise<void> {
    await this.tenantDatabase.executeWithTenant(storeId.value, (transaction) =>
      transaction.insert(ifoodEvents).values({
        storeId: storeId.value,
        eventId: event.eventId.value,
        eventType: event.eventType,
        payload: event.payload,
      }),
    );
  }

  async markAsProcessed(storeId: StoreId, eventId: IFoodEventId): Promise<void> {
    await this.tenantDatabase.executeWithTenant(storeId.value, (transaction) =>
      transaction
        .update(ifoodEvents)
        .set({ processed: true })
        .where(eq(ifoodEvents.eventId, eventId.value)),
    );
  }

  async markAsAcknowledged(storeId: StoreId, eventIds: ReadonlyArray<IFoodEventId>): Promise<void> {
    if (eventIds.length === 0) return;
    const rawIds = eventIds.map((eventId) => eventId.value);
    await this.tenantDatabase.executeWithTenant(storeId.value, (transaction) =>
      transaction
        .update(ifoodEvents)
        .set({ acknowledged: true })
        .where(inArray(ifoodEvents.eventId, rawIds)),
    );
  }
}
