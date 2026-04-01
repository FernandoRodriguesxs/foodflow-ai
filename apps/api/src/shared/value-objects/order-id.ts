const INVALID_ORDER_ID = "Order ID must be a non-empty string";

export class OrderId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): OrderId {
    if (!value || value.trim().length === 0) {
      throw new Error(INVALID_ORDER_ID);
    }
    return new OrderId(value.trim());
  }
}
