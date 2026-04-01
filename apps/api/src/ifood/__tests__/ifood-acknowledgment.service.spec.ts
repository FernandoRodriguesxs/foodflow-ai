import { IFoodAcknowledgmentService } from "../ifood-acknowledgment.service";
import type { IFoodAcknowledgmentClient } from "../ifood-acknowledgment-client";
import type { IFoodEventRepository } from "../ifood-event.repository";
import { IFoodEventId } from "../value-objects/ifood-event-id";
import { FAKE_STORE_ID_VO } from "./fixtures";

describe("IFoodAcknowledgmentService", () => {
  const mockClient = {
    acknowledgeEvents: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodAcknowledgmentClient>;

  const mockRepository = {
    markAsAcknowledged: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodEventRepository>;

  const service = new IFoodAcknowledgmentService(mockClient, mockRepository);

  afterEach(() => jest.clearAllMocks());

  it("should acknowledge events via client and mark in database", async () => {
    const eventIds = [IFoodEventId.create("event-1"), IFoodEventId.create("event-2")];

    await service.acknowledgeEvents(FAKE_STORE_ID_VO, eventIds);

    expect(mockClient.acknowledgeEvents).toHaveBeenCalledWith(eventIds);
    expect(mockRepository.markAsAcknowledged).toHaveBeenCalledWith(FAKE_STORE_ID_VO, eventIds);
  });

  it("should skip when event list is empty", async () => {
    await service.acknowledgeEvents(FAKE_STORE_ID_VO, []);

    expect(mockClient.acknowledgeEvents).not.toHaveBeenCalled();
    expect(mockRepository.markAsAcknowledged).not.toHaveBeenCalled();
  });

  it("should not mark database when client request fails", async () => {
    mockClient.acknowledgeEvents.mockRejectedValueOnce(new Error("api error"));

    await expect(
      service.acknowledgeEvents(FAKE_STORE_ID_VO, [IFoodEventId.create("event-1")]),
    ).rejects.toThrow("api error");
    expect(mockRepository.markAsAcknowledged).not.toHaveBeenCalled();
  });
});
