const INVALID_EVENT_ID = "iFood event ID must be a non-empty string";

export class IFoodEventId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): IFoodEventId {
    if (!value || value.trim().length === 0) {
      throw new Error(INVALID_EVENT_ID);
    }
    return new IFoodEventId(value.trim());
  }
}
