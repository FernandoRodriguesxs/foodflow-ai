import { IFoodPollingClient } from "@ifood/ifood-polling-client";
import type { IFoodAuthService } from "@ifood/ifood-auth.service";
import { createFakePollingPayloads } from "./fixtures";

const FAKE_TOKEN = "bearer-token-123";

describe("IFoodPollingClient", () => {
  const mockAuthService = {
    getAccessToken: jest.fn().mockResolvedValue(FAKE_TOKEN),
  } as unknown as jest.Mocked<IFoodAuthService>;

  const client = new IFoodPollingClient(mockAuthService);

  beforeEach(() => {
    jest.clearAllMocks();
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
});
