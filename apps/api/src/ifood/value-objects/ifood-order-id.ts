const INVALID_ORDER_ID = "iFood order ID must be a non-empty string";

export class IFoodOrderId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): IFoodOrderId {
    if (!value || value.trim().length === 0) {
      throw new Error(INVALID_ORDER_ID);
    }
    return new IFoodOrderId(value.trim());
  }
}
