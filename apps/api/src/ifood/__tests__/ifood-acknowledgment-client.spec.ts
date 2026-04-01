import { IFoodAcknowledgmentClient } from "@ifood/ifood-acknowledgment-client";
import type { IFoodHttpClient } from "@ifood/ifood-http-client";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";

describe("IFoodAcknowledgmentClient", () => {
  const mockHttpClient = {
    authenticatedPost: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodHttpClient>;

  const client = new IFoodAcknowledgmentClient(mockHttpClient);

  afterEach(() => jest.clearAllMocks());

  it("should send event IDs to acknowledgment endpoint", async () => {
    const eventIds = [IFoodEventId.create("event-1"), IFoodEventId.create("event-2")];

    await client.acknowledgeEvents(eventIds);

    expect(mockHttpClient.authenticatedPost).toHaveBeenCalledWith(
      "/events/v1.0/events/acknowledgment",
      ["event-1", "event-2"],
    );
  });

  it("should skip request when event list is empty", async () => {
    await client.acknowledgeEvents([]);

    expect(mockHttpClient.authenticatedPost).not.toHaveBeenCalled();
  });
});
