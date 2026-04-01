import { Injectable } from "@nestjs/common";
import { OrderStatusRepository } from "./order-status.repository";
import { OrderStatus } from "./value-objects/order-status";
import { InvalidStatusTransitionError } from "./errors/invalid-status-transition.error";
import type { CreatedOrder } from "./orders.types";

@Injectable()
export class StatusTransitionService {
  constructor(private readonly orderStatusRepository: OrderStatusRepository) {}

  async transition(storeId: string, orderId: string, toStatus: string): Promise<CreatedOrder> {
    const order = await this.findOrderOrFail(storeId, orderId);
    const currentStatus = OrderStatus.create(order.status);
    const targetStatus = OrderStatus.create(toStatus);
    this.validateTransition(currentStatus, targetStatus);
    return this.orderStatusRepository.transitionStatus({ storeId, orderId, fromStatus: order.status, toStatus });
  }

  private async findOrderOrFail(storeId: string, orderId: string): Promise<CreatedOrder> {
    const order = await this.orderStatusRepository.findById(storeId, orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return order;
  }

  private validateTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
    if (!currentStatus.canTransitionTo(targetStatus)) {
      throw new InvalidStatusTransitionError(currentStatus.value, targetStatus.value);
    }
  }
}
