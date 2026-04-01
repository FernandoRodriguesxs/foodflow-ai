import { IFoodPollingClient } from "@ifood/ifood-polling-client";
import type { IFoodHttpClient } from "@ifood/ifood-http-client";
import type { IFoodAcknowledgmentClient } from "@ifood/ifood-acknowledgment-client";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import { createFakePollingPayloads } from "./fixtures";

describe("IFoodPollingClient", () => {
  const mockHttpClient = {
    authenticatedGet: jest.fn(),
  } as unknown as jest.Mocked<IFoodHttpClient>;

  const mockAcknowledgmentClient = {
    acknowledgeEvents: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodAcknowledgmentClient>;

  const client = new IFoodPollingClient(mockHttpClient, mockAcknowledgmentClient);

  afterEach(() => jest.clearAllMocks());

  it("should fetch events from polling endpoint", async () => {
    const fakeEvents = createFakePollingPayloads(2);
    mockHttpClient.authenticatedGet.mockResolvedValueOnce({
      json: async () => fakeEvents,
    } as unknown as Response);

    const events = await client.fetchEvents();

    expect(events).toEqual(fakeEvents);
    expect(mockHttpClient.authenticatedGet).toHaveBeenCalledWith(
      "/events/v1.0/events:polling",
    );
  });

  it("should delegate acknowledgment to acknowledgment client", async () => {
    const eventIds = [IFoodEventId.create("event-1"), IFoodEventId.create("event-2")];

    await client.acknowledgeEvents(eventIds);

    expect(mockAcknowledgmentClient.acknowledgeEvents).toHaveBeenCalledWith(eventIds);
  });
});
