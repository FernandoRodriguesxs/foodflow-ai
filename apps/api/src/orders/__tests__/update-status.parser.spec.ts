import { BadRequestException } from "@nestjs/common";
import { parseUpdateStatusBody } from "../update-status.parser";

describe("parseUpdateStatusBody", () => {
  it("should accept a valid status value", () => {
    const result = parseUpdateStatusBody({ status: "CONFIRMED" });

    expect(result.status).toBe("CONFIRMED");
  });

  it("should reject body without status", () => {
    expect(() => parseUpdateStatusBody({})).toThrow(BadRequestException);
  });

  it("should reject body with invalid status", () => {
    expect(() => parseUpdateStatusBody({ status: "UNKNOWN" })).toThrow(BadRequestException);
  });

  it("should reject null body", () => {
    expect(() => parseUpdateStatusBody(null)).toThrow(BadRequestException);
  });

  it("should return a frozen object", () => {
    const result = parseUpdateStatusBody({ status: "PLACED" });

    expect(Object.isFrozen(result)).toBe(true);
  });
});
