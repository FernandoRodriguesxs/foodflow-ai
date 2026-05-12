import { Module } from "@nestjs/common";
import { DashboardModule } from "@dashboard/dashboard.module";
import { OrderRepository } from "./order.repository";
import { OrderStatusRepository } from "./order-status.repository";
import { OrderNormalizerService } from "./order-normalizer.service";
import { StatusTransitionService } from "./status-transition.service";
import { OrderEventEmitterService } from "./order-event-emitter.service";

@Module({
  imports: [DashboardModule],
  providers: [
    OrderRepository,
    OrderStatusRepository,
    OrderNormalizerService,
    StatusTransitionService,
    OrderEventEmitterService,
  ],
  exports: [OrderNormalizerService, StatusTransitionService],
})
export class OrdersModule {}
