import { OrderStatus } from "@orders/value-objects/order-status";

describe("OrderStatus", () => {
  it("should create a valid order status", () => {
    const status = OrderStatus.create("PLACED");

    expect(status.value).toBe("PLACED");
  });

  it("should reject an invalid status value", () => {
    expect(() => OrderStatus.create("INVALID")).toThrow("Order status must be a valid status value");
  });

  it("should be immutable", () => {
    const status = OrderStatus.create("PLACED");

    expect(Object.isFrozen(status)).toBe(true);
  });

  describe("canTransitionTo", () => {
    it("should allow PLACED to CONFIRMED", () => {
      const placed = OrderStatus.create("PLACED");
      const confirmed = OrderStatus.create("CONFIRMED");

      expect(placed.canTransitionTo(confirmed)).toBe(true);
    });

    it("should allow CONFIRMED to DISPATCHED", () => {
      const confirmed = OrderStatus.create("CONFIRMED");
      const dispatched = OrderStatus.create("DISPATCHED");

      expect(confirmed.canTransitionTo(dispatched)).toBe(true);
    });

    it("should allow DISPATCHED to CONCLUDED", () => {
      const dispatched = OrderStatus.create("DISPATCHED");
      const concluded = OrderStatus.create("CONCLUDED");

      expect(dispatched.canTransitionTo(concluded)).toBe(true);
    });

    it("should allow any status to CANCELLED", () => {
      const statuses = ["PLACED", "CONFIRMED", "DISPATCHED", "CONCLUDED"];
      const cancelled = OrderStatus.create("CANCELLED");

      statuses.forEach((statusValue) => {
        const status = OrderStatus.create(statusValue);
        expect(status.canTransitionTo(cancelled)).toBe(true);
      });
    });

    it("should reject CONCLUDED to PLACED", () => {
      const concluded = OrderStatus.create("CONCLUDED");
      const placed = OrderStatus.create("PLACED");

      expect(concluded.canTransitionTo(placed)).toBe(false);
    });

    it("should reject CANCELLED to any status", () => {
      const cancelled = OrderStatus.create("CANCELLED");
      const placed = OrderStatus.create("PLACED");

      expect(cancelled.canTransitionTo(placed)).toBe(false);
    });

    it("should reject PLACED to DISPATCHED (skipping CONFIRMED)", () => {
      const placed = OrderStatus.create("PLACED");
      const dispatched = OrderStatus.create("DISPATCHED");

      expect(placed.canTransitionTo(dispatched)).toBe(false);
    });
  });
});
