import { Module } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { OrderStatusRepository } from "./order-status.repository";
import { OrderNormalizerService } from "./order-normalizer.service";
import { StatusTransitionService } from "./status-transition.service";

@Module({
  providers: [OrderRepository, OrderStatusRepository, OrderNormalizerService, StatusTransitionService],
  exports: [OrderNormalizerService, StatusTransitionService],
})
export class OrdersModule {}
