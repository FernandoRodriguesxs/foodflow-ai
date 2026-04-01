import { Module } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { OrderNormalizerService } from "./order-normalizer.service";

@Module({
  providers: [OrderRepository, OrderNormalizerService],
  exports: [OrderNormalizerService],
})
export class OrdersModule {}
