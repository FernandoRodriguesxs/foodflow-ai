import { Inject, Injectable } from "@nestjs/common";
import { inArray } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { DRIZZLE_TOKEN } from "@database/database.constants";
import { ifoodEvents } from "@database/schemas/ifood-events.schema";
import type { IFoodWebhookEventPayload } from "./ifood.types";

@Injectable()
export class IFoodEventDeduplicator {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly database: NeonHttpDatabase,
  ) {}

  async filterNewEvents(
    events: ReadonlyArray<IFoodWebhookEventPayload>,
  ): Promise<ReadonlyArray<IFoodWebhookEventPayload>> {
    if (events.length === 0) return [];
    const existingIds = await this.findExistingEventIds(events);
    return events.filter((event) => !existingIds.has(event.id));
  }

  private async findExistingEventIds(
    events: ReadonlyArray<IFoodWebhookEventPayload>,
  ): Promise<Set<string>> {
    const eventIds = events.map((event) => event.id);
    const results = await this.database
      .select({ eventId: ifoodEvents.eventId })
      .from(ifoodEvents)
      .where(inArray(ifoodEvents.eventId, eventIds));
    return new Set(results.map((row) => row.eventId));
  }
}
