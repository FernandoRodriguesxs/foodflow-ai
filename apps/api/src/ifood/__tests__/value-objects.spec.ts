import { MerchantId } from "../value-objects/merchant-id";
import { IFoodEventId } from "../value-objects/ifood-event-id";
import { IFoodOrderId } from "../value-objects/ifood-order-id";
import { StoreId } from "../value-objects/store-id";

describe("MerchantId", () => {
  it("should create with a valid string", () => {
    const merchantId = MerchantId.create("merchant-123");
    expect(merchantId.value).toBe("merchant-123");
  });

  it("should trim whitespace", () => {
    expect(MerchantId.create("  abc  ").value).toBe("abc");
  });

  it("should throw on empty string", () => {
    expect(() => MerchantId.create("")).toThrow();
  });

  it("should throw on whitespace-only string", () => {
    expect(() => MerchantId.create("   ")).toThrow();
  });

  it("should be frozen", () => {
    const merchantId = MerchantId.create("id");
    expect(Object.isFrozen(merchantId)).toBe(true);
  });
});

describe("IFoodEventId", () => {
  it("should create with a valid string", () => {
    expect(IFoodEventId.create("evt-1").value).toBe("evt-1");
  });

  it("should throw on empty string", () => {
    expect(() => IFoodEventId.create("")).toThrow();
  });

  it("should be frozen", () => {
    expect(Object.isFrozen(IFoodEventId.create("x"))).toBe(true);
  });
});

describe("IFoodOrderId", () => {
  it("should create with a valid string", () => {
    expect(IFoodOrderId.create("ord-1").value).toBe("ord-1");
  });

  it("should throw on empty string", () => {
    expect(() => IFoodOrderId.create("")).toThrow();
  });

  it("should be frozen", () => {
    expect(Object.isFrozen(IFoodOrderId.create("x"))).toBe(true);
  });
});

describe("StoreId", () => {
  it("should create with a valid string", () => {
    expect(StoreId.create("store-1").value).toBe("store-1");
  });

  it("should trim whitespace", () => {
    expect(StoreId.create("  store-1  ").value).toBe("store-1");
  });

  it("should throw on empty string", () => {
    expect(() => StoreId.create("")).toThrow();
  });

  it("should be frozen", () => {
    expect(Object.isFrozen(StoreId.create("x"))).toBe(true);
  });
});
