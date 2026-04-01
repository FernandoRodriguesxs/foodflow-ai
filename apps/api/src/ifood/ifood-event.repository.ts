import { Injectable } from "@nestjs/common";
import { TenantDatabaseService } from "@tenant/tenant-database.service";
import { ifoodEvents } from "@database/schemas/ifood-events.schema";
import type { StoreId } from "@ifood/value-objects/store-id";
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
}
