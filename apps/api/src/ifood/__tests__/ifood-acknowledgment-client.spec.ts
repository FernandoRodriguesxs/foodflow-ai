import { IFoodAcknowledgmentClient } from "@ifood/ifood-acknowledgment-client";
import type { IFoodAuthService } from "@ifood/ifood-auth.service";
import { IFoodEventId } from "@ifood/value-objects/ifood-event-id";

const FAKE_TOKEN = "bearer-token-123";
const FAKE_BASE_URL = "https://merchant-api.ifood.com.br";

describe("IFoodAcknowledgmentClient", () => {
  const mockAuthService = {
    getAccessToken: jest.fn().mockResolvedValue(FAKE_TOKEN),
  } as unknown as jest.Mocked<IFoodAuthService>;

  const client = new IFoodAcknowledgmentClient(mockAuthService);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IFOOD_API_BASE_URL = FAKE_BASE_URL;
    global.fetch = jest.fn();
  });

  it("should send event IDs with authorization header", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    const eventIds = [IFoodEventId.create("event-1"), IFoodEventId.create("event-2")];

    await client.acknowledgeEvents(eventIds);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events/v1.0/events/acknowledgment"),
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Bearer ${FAKE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["event-1", "event-2"]),
      }),
    );
  });

  it("should skip request when event list is empty", async () => {
    await client.acknowledgeEvents([]);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should throw when acknowledgment request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      client.acknowledgeEvents([IFoodEventId.create("event-1")]),
    ).rejects.toThrow("iFood acknowledgment request failed: 500");
  });
});
