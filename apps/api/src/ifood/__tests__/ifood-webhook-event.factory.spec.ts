import { createWebhookEvent } from "../ifood-webhook-event.factory";
import { createFakePayload } from "./fixtures";

describe("createWebhookEvent", () => {
  it("should map payload fields to Value Objects", () => {
    const payload = createFakePayload();

    const event = createWebhookEvent(payload);

    expect(event.eventId.value).toBe(payload.id);
    expect(event.merchantId.value).toBe(payload.merchantId);
    expect(event.orderId.value).toBe(payload.orderId);
    expect(event.eventType).toBe(payload.fullCode);
    expect(event.payload).toBe(payload);
  });

  it("should return a frozen object", () => {
    expect(Object.isFrozen(createWebhookEvent(createFakePayload()))).toBe(true);
  });

  it("should throw when payload has empty event ID", () => {
    const payload = { ...createFakePayload(), id: "" };
    expect(() => createWebhookEvent(payload)).toThrow();
  });

  it("should throw when payload has empty merchant ID", () => {
    const payload = { ...createFakePayload(), merchantId: "" };
    expect(() => createWebhookEvent(payload)).toThrow();
  });
});
