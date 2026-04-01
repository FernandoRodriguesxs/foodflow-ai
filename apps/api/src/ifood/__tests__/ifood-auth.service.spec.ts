import { IFoodAuthService } from "@ifood/ifood-auth.service";
import {
  IFOOD_TOKEN_CACHE_KEY,
  IFOOD_TOKEN_SAFETY_MARGIN_SECONDS,
} from "@ifood/ifood.constants";

const FAKE_ACCESS_TOKEN = "fake-access-token-abc";
const FAKE_EXPIRES_IN = 3600;
const FAKE_BASE_URL = "https://merchant-api.ifood.com.br";
const FAKE_CLIENT_ID = "test-client-id";
const FAKE_CLIENT_SECRET = "test-client-secret";

describe("IFoodAuthService", () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue("OK"),
  } as any;

  const service = new IFoodAuthService(mockRedis);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IFOOD_API_BASE_URL = FAKE_BASE_URL;
    process.env.IFOOD_CLIENT_ID = FAKE_CLIENT_ID;
    process.env.IFOOD_CLIENT_SECRET = FAKE_CLIENT_SECRET;
    global.fetch = jest.fn();
  });

  it("should return cached token when available in Redis", async () => {
    mockRedis.get.mockResolvedValueOnce(FAKE_ACCESS_TOKEN);

    const token = await service.getAccessToken();

    expect(token).toBe(FAKE_ACCESS_TOKEN);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should request new token when cache is empty", async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: FAKE_ACCESS_TOKEN, expires_in: FAKE_EXPIRES_IN }),
    });

    const token = await service.getAccessToken();

    expect(token).toBe(FAKE_ACCESS_TOKEN);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should cache token with correct TTL", async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: FAKE_ACCESS_TOKEN, expires_in: FAKE_EXPIRES_IN }),
    });

    await service.getAccessToken();

    const expectedTtl = FAKE_EXPIRES_IN - IFOOD_TOKEN_SAFETY_MARGIN_SECONDS;
    expect(mockRedis.set).toHaveBeenCalledWith(
      IFOOD_TOKEN_CACHE_KEY,
      FAKE_ACCESS_TOKEN,
      "EX",
      expectedTtl,
    );
  });

  it("should throw when OAuth request fails", async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(service.getAccessToken()).rejects.toThrow("iFood OAuth request failed: 401");
  });
});
