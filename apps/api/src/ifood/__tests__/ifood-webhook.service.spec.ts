import { IFoodWebhookService } from "../ifood-webhook.service";
import type { IFoodEventRepository } from "../ifood-event.repository";
import type { IFoodAcknowledgmentService } from "../ifood-acknowledgment.service";
import type { MerchantStoreResolver } from "../merchant-store.resolver";
import { PROCESS_IFOOD_EVENT_JOB } from "../ifood.constants";
import {
  createFakeWebhookEvent,
  FAKE_STORE_ID,
  FAKE_STORE_ID_VO,
  FAKE_EVENT_ID,
} from "./fixtures";

describe("IFoodWebhookService", () => {
  const mockRepository = {
    saveEvent: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodEventRepository>;

  const mockAcknowledgment = {
    acknowledgeEvents: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodAcknowledgmentService>;

  const mockResolver = {
    resolveStoreId: jest.fn().mockResolvedValue(FAKE_STORE_ID_VO),
  } as unknown as jest.Mocked<MerchantStoreResolver>;

  const mockQueue = { add: jest.fn().mockResolvedValue(undefined) } as any;

  const service = new IFoodWebhookService(mockRepository, mockAcknowledgment, mockResolver, mockQueue);

  afterEach(() => jest.clearAllMocks());

  it("should resolve store, save event, acknowledge, and enqueue job", async () => {
    const event = createFakeWebhookEvent();

    await service.processWebhookEvent(event);

    expect(mockResolver.resolveStoreId).toHaveBeenCalledWith(event.merchantId);
    expect(mockRepository.saveEvent).toHaveBeenCalledWith(FAKE_STORE_ID_VO, event);
    expect(mockAcknowledgment.acknowledgeEvents).toHaveBeenCalledWith(
      FAKE_STORE_ID_VO,
      [event.eventId],
    );
    expect(mockQueue.add).toHaveBeenCalledWith(
      PROCESS_IFOOD_EVENT_JOB,
      { eventId: FAKE_EVENT_ID, storeId: FAKE_STORE_ID },
    );
  });

  it("should not save or enqueue when store resolution fails", async () => {
    mockResolver.resolveStoreId.mockRejectedValueOnce(new Error("not found"));

    await expect(service.processWebhookEvent(createFakeWebhookEvent())).rejects.toThrow("not found");
    expect(mockRepository.saveEvent).not.toHaveBeenCalled();
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it("should not enqueue when saving the event fails", async () => {
    mockRepository.saveEvent.mockRejectedValueOnce(new Error("db error"));

    await expect(service.processWebhookEvent(createFakeWebhookEvent())).rejects.toThrow("db error");
    expect(mockQueue.add).not.toHaveBeenCalled();
  });
});
