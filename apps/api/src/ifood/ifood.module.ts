import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IFoodWebhookController } from "./ifood-webhook.controller";
import { IFoodWebhookService } from "./ifood-webhook.service";
import { IFoodEventRepository } from "./ifood-event.repository";
import { MerchantStoreResolver } from "./merchant-store.resolver";
import { IFOOD_EVENT_QUEUE, parseRedisConnection } from "./ifood.constants";

@Module({
  imports: [
    BullModule.forRoot({ connection: parseRedisConnection() }),
    BullModule.registerQueue({ name: IFOOD_EVENT_QUEUE }),
  ],
  controllers: [IFoodWebhookController],
  providers: [IFoodWebhookService, IFoodEventRepository, MerchantStoreResolver],
  exports: [IFoodWebhookService],
})
export class IFoodModule {}
