const INVALID_MERCHANT_ID = "Merchant ID must be a non-empty string";

export class MerchantId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): MerchantId {
    if (!value || value.trim().length === 0) {
      throw new Error(INVALID_MERCHANT_ID);
    }
    return new MerchantId(value.trim());
  }
}
