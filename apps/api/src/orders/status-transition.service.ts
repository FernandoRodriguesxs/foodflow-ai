import { Injectable, NotFoundException } from "@nestjs/common";
import type { StoreId } from "@shared/value-objects/store-id";
import type { OrderId } from "@shared/value-objects/order-id";
import { OrderStatusRepository } from "./order-status.repository";
import { OrderEventEmitterService } from "./order-event-emitter.service";
import { OrderStatus } from "./value-objects/order-status";
import { InvalidStatusTransitionError } from "./errors/invalid-status-transition.error";
import type { CreatedOrder } from "./orders.types";

@Injectable()
export class StatusTransitionService {
  constructor(
    private readonly orderStatusRepository: OrderStatusRepository,
    private readonly eventEmitter: OrderEventEmitterService,
  ) {}

  async transition(storeId: StoreId, orderId: OrderId, toStatus: string): Promise<CreatedOrder> {
    const order = await this.findOrderOrFail(storeId, orderId);
    const currentStatus = OrderStatus.create(order.status);
    const targetStatus = OrderStatus.create(toStatus);
    this.validateTransition(currentStatus, targetStatus);
    const updatedOrder = await this.orderStatusRepository.transitionStatus({
      storeId: storeId.value, orderId: orderId.value, fromStatus: order.status, toStatus,
    });
    this.eventEmitter.emitStatusUpdated(updatedOrder);
    return updatedOrder;
  }

  private async findOrderOrFail(storeId: StoreId, orderId: OrderId): Promise<CreatedOrder> {
    const order = await this.orderStatusRepository.findById(storeId, orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId.value} not found`);
    }
    return order;
  }

  private validateTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
    if (!currentStatus.canTransitionTo(targetStatus)) {
      throw new InvalidStatusTransitionError(currentStatus.value, targetStatus.value);
    }
  }
}
