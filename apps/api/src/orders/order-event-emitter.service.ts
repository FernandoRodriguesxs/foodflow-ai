import { Injectable } from "@nestjs/common";
import { DashboardGateway } from "@dashboard/dashboard.gateway";
import { DASHBOARD_EVENTS } from "@dashboard/dashboard.constants";
import type { CreatedOrder } from "./orders.types";

@Injectable()
export class OrderEventEmitterService {
  constructor(private readonly gateway: DashboardGateway) {}

  emitNewOrder(order: CreatedOrder): void {
    this.gateway.broadcastToStore(order.storeId, DASHBOARD_EVENTS.NEW_ORDER, order);
  }

  emitStatusUpdated(order: CreatedOrder): void {
    const payload = { id: order.id, status: order.status };
    this.gateway.broadcastToStore(order.storeId, DASHBOARD_EVENTS.ORDER_STATUS_UPDATED, payload);
  }
}
