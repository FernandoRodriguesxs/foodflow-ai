import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import Redis from "ioredis";
import { IFoodWebhookController } from "./ifood-webhook.controller";
import { IFoodWebhookService } from "./ifood-webhook.service";
import { IFoodEventRepository } from "./ifood-event.repository";
import { IFoodAcknowledgmentClient } from "./ifood-acknowledgment-client";
import { IFoodAcknowledgmentService } from "./ifood-acknowledgment.service";
import { MerchantStoreResolver } from "./merchant-store.resolver";
import { IFoodAuthService } from "./ifood-auth.service";
import { IFoodPollingClient } from "./ifood-polling-client";
import { IFoodEventDeduplicator } from "./ifood-event-deduplicator";
import { IFoodPollingProcessor } from "./ifood-polling.processor";
import { IFoodPollingScheduler } from "./ifood-polling.scheduler";
import { IFoodHttpClient } from "./ifood-http-client";
import { IFoodOrderClient } from "./ifood-order-client";
import { IFoodOrderProcessor } from "./ifood-order.processor";
import {
  IFOOD_EVENT_QUEUE,
  IFOOD_POLLING_QUEUE,
  IFOOD_REDIS_TOKEN,
  parseRedisConnection,
} from "./ifood.constants";

@Module({
  imports: [
    BullModule.forRoot({ connection: parseRedisConnection() }),
    BullModule.registerQueue({ name: IFOOD_EVENT_QUEUE }),
    BullModule.registerQueue({ name: IFOOD_POLLING_QUEUE }),
  ],
  controllers: [IFoodWebhookController],
  providers: [
    IFoodWebhookService,
    IFoodEventRepository,
    IFoodAcknowledgmentClient,
    IFoodAcknowledgmentService,
    MerchantStoreResolver,
    IFoodAuthService,
    IFoodHttpClient,
    IFoodPollingClient,
    IFoodEventDeduplicator,
    IFoodPollingProcessor,
    IFoodPollingScheduler,
    IFoodOrderClient,
    IFoodOrderProcessor,
    {
      provide: IFOOD_REDIS_TOKEN,
      useFactory: () => new Redis(parseRedisConnection()),
    },
  ],
  exports: [IFoodWebhookService],
})
export class IFoodModule {}
