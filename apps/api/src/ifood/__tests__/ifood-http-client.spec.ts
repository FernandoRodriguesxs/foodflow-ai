import { IFoodHttpClient } from "@ifood/ifood-http-client";
import type { IFoodAuthService } from "@ifood/ifood-auth.service";

const FAKE_TOKEN = "bearer-token-123";
const FAKE_BASE_URL = "https://merchant-api.ifood.com.br";

describe("IFoodHttpClient", () => {
  const mockAuthService = {
    getAccessToken: jest.fn().mockResolvedValue(FAKE_TOKEN),
  } as unknown as jest.Mocked<IFoodAuthService>;

  const client = new IFoodHttpClient(mockAuthService);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IFOOD_API_BASE_URL = FAKE_BASE_URL;
    global.fetch = jest.fn();
  });

  it("should send GET request with authorization header", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await client.authenticatedGet("/test/path");

    expect(global.fetch).toHaveBeenCalledWith(
      `${FAKE_BASE_URL}/test/path`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: `Bearer ${FAKE_TOKEN}` }),
      }),
    );
  });

  it("should send POST request with JSON body and authorization", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await client.authenticatedPost("/test/path", { key: "value" });

    expect(global.fetch).toHaveBeenCalledWith(
      `${FAKE_BASE_URL}/test/path`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${FAKE_TOKEN}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ key: "value" }),
      }),
    );
  });

  it("should throw when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(client.authenticatedGet("/failing/path")).rejects.toThrow(
      "iFood request failed: /failing/path 500",
    );
  });

  it("should return the response on success", async () => {
    const fakeResponse = { ok: true, json: async () => ({ data: "test" }) };
    (global.fetch as jest.Mock).mockResolvedValueOnce(fakeResponse);

    const result = await client.authenticatedGet("/test/path");

    expect(result).toBe(fakeResponse);
  });
});
