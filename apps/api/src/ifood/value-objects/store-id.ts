const INVALID_STORE_ID = "Store ID must be a non-empty string";

export class StoreId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): StoreId {
    if (!value || value.trim().length === 0) {
      throw new Error(INVALID_STORE_ID);
    }
    return new StoreId(value.trim());
  }
}
