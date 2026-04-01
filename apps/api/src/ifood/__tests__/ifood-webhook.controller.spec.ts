import { IFoodWebhookController } from "../ifood-webhook.controller";
import type { IFoodWebhookService } from "../ifood-webhook.service";
import { createFakePayload } from "./fixtures";

describe("IFoodWebhookController", () => {
  const mockService = {
    processWebhookEvent: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodWebhookService>;

  const controller = new IFoodWebhookController(mockService);

  afterEach(() => jest.clearAllMocks());

  it("should delegate the parsed event to the webhook service", async () => {
    const payload = createFakePayload();

    await controller.receiveEvent(payload);

    expect(mockService.processWebhookEvent).toHaveBeenCalledTimes(1);
    const receivedEvent = mockService.processWebhookEvent.mock.calls[0][0];
    expect(receivedEvent.eventId.value).toBe(payload.id);
    expect(receivedEvent.merchantId.value).toBe(payload.merchantId);
    expect(receivedEvent.eventType).toBe(payload.fullCode);
  });

  it("should propagate errors from the service", async () => {
    mockService.processWebhookEvent.mockRejectedValueOnce(new Error("fail"));

    await expect(controller.receiveEvent(createFakePayload())).rejects.toThrow("fail");
  });
});
