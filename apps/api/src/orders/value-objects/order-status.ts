import type { StatusValue } from "@orders/orders.types";

const ALLOWED_TRANSITIONS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["PLACED", new Set(["CONFIRMED", "CANCELLED"])],
  ["CONFIRMED", new Set(["DISPATCHED", "CANCELLED"])],
  ["DISPATCHED", new Set(["CONCLUDED", "CANCELLED"])],
  ["CONCLUDED", new Set(["CANCELLED"])],
  ["CANCELLED", new Set()],
]);

const INVALID_STATUS = "Order status must be a valid status value";

export class OrderStatus {
  private constructor(readonly value: StatusValue) {
    Object.freeze(this);
  }

  static create(value: string): OrderStatus {
    if (!ALLOWED_TRANSITIONS.has(value)) {
      throw new Error(INVALID_STATUS);
    }
    return new OrderStatus(value as StatusValue);
  }

  canTransitionTo(target: OrderStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS.get(this.value);
    return allowed?.has(target.value) ?? false;
  }
}
