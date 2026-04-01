import { Injectable } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { IFOOD_ORDER_SOURCE } from "./orders.constants";
import type { RawOrderData, CreateOrderData, CreatedOrder, OrderSource } from "./orders.types";

@Injectable()
export class OrderNormalizerService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async normalizeIFoodOrder(rawOrder: RawOrderData): Promise<CreatedOrder> {
    const orderData = buildOrderData(rawOrder, IFOOD_ORDER_SOURCE);
    return this.orderRepository.saveOrder(orderData);
  }
}

function buildOrderData(rawOrder: RawOrderData, source: OrderSource): CreateOrderData {
  return Object.freeze({ ...rawOrder, source });
}
