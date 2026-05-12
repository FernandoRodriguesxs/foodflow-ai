import { BadRequestException } from "@nestjs/common";
import { parseOrderListQuery } from "../order-list.parser";

describe("parseOrderListQuery", () => {
  it("should apply defaults when no params are provided", () => {
    const filters = parseOrderListQuery({});

    expect(filters.statuses).toEqual([]);
    expect(filters.source).toBeUndefined();
    expect(filters.page).toBe(1);
    expect(filters.limit).toBe(20);
  });

  it("should split status CSV into validated array", () => {
    const filters = parseOrderListQuery({ status: "PLACED,CONFIRMED" });

    expect(filters.statuses).toEqual(["PLACED", "CONFIRMED"]);
  });

  it("should trim whitespace around status values", () => {
    const filters = parseOrderListQuery({ status: " PLACED , CONFIRMED " });

    expect(filters.statuses).toEqual(["PLACED", "CONFIRMED"]);
  });

  it("should accept valid source", () => {
    const filters = parseOrderListQuery({ source: "whatsapp" });

    expect(filters.source).toBe("whatsapp");
  });

  it("should reject invalid status", () => {
    expect(() => parseOrderListQuery({ status: "UNKNOWN" })).toThrow(BadRequestException);
  });

  it("should reject invalid source", () => {
    expect(() => parseOrderListQuery({ source: "telegram" })).toThrow(BadRequestException);
  });

  it("should reject non-integer page", () => {
    expect(() => parseOrderListQuery({ page: "1.5" })).toThrow(BadRequestException);
  });

  it("should reject zero or negative page", () => {
    expect(() => parseOrderListQuery({ page: "0" })).toThrow(BadRequestException);
  });

  it("should reject limit above the maximum", () => {
    expect(() => parseOrderListQuery({ limit: "101" })).toThrow(BadRequestException);
  });

  it("should return a frozen filters object", () => {
    const filters = parseOrderListQuery({});

    expect(Object.isFrozen(filters)).toBe(true);
  });
});
