import { Injectable } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { OrderEventEmitterService } from "./order-event-emitter.service";
import { IFOOD_ORDER_SOURCE, WHATSAPP_ORDER_SOURCE } from "./orders.constants";
import type { RawOrderData, CreateOrderData, CreatedOrder, OrderSource } from "./orders.types";

@Injectable()
export class OrderNormalizerService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventEmitter: OrderEventEmitterService,
  ) {}

  async normalizeIFoodOrder(rawOrder: RawOrderData): Promise<CreatedOrder> {
    return this.persistAndAnnounce(rawOrder, IFOOD_ORDER_SOURCE);
  }

  async normalizeWhatsAppOrder(rawOrder: RawOrderData): Promise<CreatedOrder> {
    return this.persistAndAnnounce(rawOrder, WHATSAPP_ORDER_SOURCE);
  }

  private async persistAndAnnounce(rawOrder: RawOrderData, source: OrderSource): Promise<CreatedOrder> {
    const orderData = buildOrderData(rawOrder, source);
    const createdOrder = await this.orderRepository.saveOrder(orderData);
    this.eventEmitter.emitNewOrder(createdOrder);
    return createdOrder;
  }
}

function buildOrderData(rawOrder: RawOrderData, source: OrderSource): CreateOrderData {
  return Object.freeze({ ...rawOrder, source });
}
