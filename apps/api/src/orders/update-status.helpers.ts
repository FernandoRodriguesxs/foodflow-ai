import { UnprocessableEntityException } from "@nestjs/common";
import type { StoreId } from "@shared/value-objects/store-id";
import type { OrderId } from "@shared/value-objects/order-id";
import { StatusTransitionService } from "./status-transition.service";
import { InvalidStatusTransitionError } from "./errors/invalid-status-transition.error";
import type { CreatedOrder } from "./orders.types";

export async function runStatusTransition(
  service: StatusTransitionService,
  storeId: StoreId,
  orderId: OrderId,
  status: string,
): Promise<CreatedOrder> {
  try {
    return await service.transition(storeId, orderId, status);
  } catch (error) {
    if (error instanceof InvalidStatusTransitionError) {
      throw new UnprocessableEntityException(error.message);
    }
    throw error;
  }
}
