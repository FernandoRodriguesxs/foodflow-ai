import { Module } from "@nestjs/common";
import { DashboardModule } from "@dashboard/dashboard.module";
import { OrderRepository } from "./order.repository";
import { OrderStatusRepository } from "./order-status.repository";
import { OrderListingRepository } from "./order-listing.repository";
import { OrderNormalizerService } from "./order-normalizer.service";
import { StatusTransitionService } from "./status-transition.service";
import { OrderEventEmitterService } from "./order-event-emitter.service";
import { OrderListingService } from "./order-listing.service";
import { OrdersController } from "./orders.controller";

@Module({
  imports: [DashboardModule],
  controllers: [OrdersController],
  providers: [
    OrderRepository,
    OrderStatusRepository,
    OrderListingRepository,
    OrderNormalizerService,
    StatusTransitionService,
    OrderEventEmitterService,
    OrderListingService,
  ],
  exports: [OrderNormalizerService, StatusTransitionService, OrderListingService],
})
export class OrdersModule {}
