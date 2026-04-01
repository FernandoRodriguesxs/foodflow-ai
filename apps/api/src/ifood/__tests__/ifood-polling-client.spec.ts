import { IFoodPollingClient } from "@ifood/ifood-polling-client";
import type { IFoodAuthService } from "@ifood/ifood-auth.service";
import type { IFoodAcknowledgmentClient } from "@ifood/ifood-acknowledgment-client";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";
import { createFakePollingPayloads } from "./fixtures";

const FAKE_TOKEN = "bearer-token-123";
const FAKE_BASE_URL = "https://merchant-api.ifood.com.br";

describe("IFoodPollingClient", () => {
  const mockAuthService = {
    getAccessToken: jest.fn().mockResolvedValue(FAKE_TOKEN),
  } as unknown as jest.Mocked<IFoodAuthService>;

  const mockAcknowledgmentClient = {
    acknowledgeEvents: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<IFoodAcknowledgmentClient>;

  const client = new IFoodPollingClient(mockAuthService, mockAcknowledgmentClient);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IFOOD_API_BASE_URL = FAKE_BASE_URL;
    global.fetch = jest.fn();
  });

  it("should fetch events with authorization header", async () => {
    const fakeEvents = createFakePollingPayloads(2);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fakeEvents,
    });

    const events = await client.fetchEvents();

    expect(events).toEqual(fakeEvents);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events/v1.0/events:polling"),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${FAKE_TOKEN}` },
      }),
    );
  });

  it("should throw when polling request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(client.fetchEvents()).rejects.toThrow("iFood polling request failed: 500");
  });

  it("should delegate acknowledgment to acknowledgment client", async () => {
    const eventIds = [IFoodEventId.create("event-1"), IFoodEventId.create("event-2")];

    await client.acknowledgeEvents(eventIds);

    expect(mockAcknowledgmentClient.acknowledgeEvents).toHaveBeenCalledWith(eventIds);
  });
});
