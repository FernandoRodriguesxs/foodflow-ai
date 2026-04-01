import { IFoodPollingProcessor } from "@ifood/ifood-polling.processor";
import type { IFoodPollingClient } from "@ifood/ifood-polling-client";
import type { IFoodEventDeduplicator } from "@ifood/ifood-event-deduplicator";
import type { IFoodWebhookService } from "@ifood/ifood-webhook.service";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import { createFakePollingPayloads } from "./fixtures";

describe("IFoodPollingProcessor", () => {
  const mockPollingClient = {
    fetchEvents: jest.fn(),
    acknowledgeEvents: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodPollingClient>;

  const mockDeduplicator = {
    filterNewEvents: jest.fn(),
  } as unknown as jest.Mocked<IFoodEventDeduplicator>;

  const mockWebhookService = {
    processWebhookEvent: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodWebhookService>;

  const processor = new IFoodPollingProcessor(
    mockPollingClient,
    mockDeduplicator,
    mockWebhookService,
  );

  afterEach(() => jest.clearAllMocks());

  it("should acknowledge and process new events through webhook service", async () => {
    const polledEvents = createFakePollingPayloads(3);
    const newEvents = createFakePollingPayloads(2);
    mockPollingClient.fetchEvents.mockResolvedValueOnce(polledEvents);
    mockDeduplicator.filterNewEvents.mockResolvedValueOnce(newEvents);

    await processor.process({} as any);

    expect(mockPollingClient.acknowledgeEvents).toHaveBeenCalledWith(
      polledEvents.map((event) => IFoodEventId.create(event.id)),
    );
    expect(mockDeduplicator.filterNewEvents).toHaveBeenCalledWith(polledEvents);
    expect(mockWebhookService.processWebhookEvent).toHaveBeenCalledTimes(2);
  });

  it("should skip processing when no new events found", async () => {
    mockPollingClient.fetchEvents.mockResolvedValueOnce(createFakePollingPayloads(2));
    mockDeduplicator.filterNewEvents.mockResolvedValueOnce([]);

    await processor.process({} as any);

    expect(mockWebhookService.processWebhookEvent).not.toHaveBeenCalled();
  });

  it("should handle empty polling response", async () => {
    mockPollingClient.fetchEvents.mockResolvedValueOnce([]);
    mockDeduplicator.filterNewEvents.mockResolvedValueOnce([]);

    await processor.process({} as any);

    expect(mockWebhookService.processWebhookEvent).not.toHaveBeenCalled();
  });

  it("should propagate errors from polling client", async () => {
    mockPollingClient.fetchEvents.mockRejectedValueOnce(new Error("network error"));

    await expect(processor.process({} as any)).rejects.toThrow("network error");
  });

  it("should continue processing remaining events when one fails", async () => {
    const newEvents = createFakePollingPayloads(3);
    mockPollingClient.fetchEvents.mockResolvedValueOnce(newEvents);
    mockDeduplicator.filterNewEvents.mockResolvedValueOnce(newEvents);
    mockWebhookService.processWebhookEvent
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("event-1 failed"))
      .mockResolvedValueOnce(undefined);

    await processor.process({} as any);

    expect(mockWebhookService.processWebhookEvent).toHaveBeenCalledTimes(3);
  });
});
