import {
  getRedisUrl,
  parseRedisConnection,
  getIFoodApiBaseUrl,
  getIFoodClientId,
  getIFoodClientSecret,
} from "../ifood.constants";

describe("getRedisUrl", () => {
  const originalEnv = process.env.REDIS_URL;

  afterEach(() => {
    process.env.REDIS_URL = originalEnv;
  });

  it("should return the REDIS_URL when set", () => {
    process.env.REDIS_URL = "redis://localhost:6379";

    expect(getRedisUrl()).toBe("redis://localhost:6379");
  });

  it("should throw when REDIS_URL is not set", () => {
    delete process.env.REDIS_URL;

    expect(() => getRedisUrl()).toThrow("REDIS_URL environment variable is not set");
  });
});

describe("parseRedisConnection", () => {
  const originalEnv = process.env.REDIS_URL;

  afterEach(() => {
    process.env.REDIS_URL = originalEnv;
  });

  it("should parse host, port and password from URL", () => {
    process.env.REDIS_URL = "redis://:secret@myhost:6380";

    const result = parseRedisConnection();

    expect(result.host).toBe("myhost");
    expect(result.port).toBe(6380);
    expect(result.password).toBe("secret");
  });

  it("should use default port when none is specified", () => {
    process.env.REDIS_URL = "redis://myhost";

    const result = parseRedisConnection();

    expect(result.port).toBe(6379);
  });

  it("should set password to undefined when not present", () => {
    process.env.REDIS_URL = "redis://myhost:6379";

    const result = parseRedisConnection();

    expect(result.password).toBeUndefined();
  });
});

describe("getIFoodApiBaseUrl", () => {
  const originalEnv = process.env.IFOOD_API_BASE_URL;

  afterEach(() => {
    process.env.IFOOD_API_BASE_URL = originalEnv;
  });

  it("should return the value when set", () => {
    process.env.IFOOD_API_BASE_URL = "https://merchant-api.ifood.com.br";

    expect(getIFoodApiBaseUrl()).toBe("https://merchant-api.ifood.com.br");
  });

  it("should throw when not set", () => {
    delete process.env.IFOOD_API_BASE_URL;

    expect(() => getIFoodApiBaseUrl()).toThrow("IFOOD_API_BASE_URL environment variable is not set");
  });
});

describe("getIFoodClientId", () => {
  const originalEnv = process.env.IFOOD_CLIENT_ID;

  afterEach(() => {
    process.env.IFOOD_CLIENT_ID = originalEnv;
  });

  it("should return the value when set", () => {
    process.env.IFOOD_CLIENT_ID = "my-client-id";

    expect(getIFoodClientId()).toBe("my-client-id");
  });

  it("should throw when not set", () => {
    delete process.env.IFOOD_CLIENT_ID;

    expect(() => getIFoodClientId()).toThrow("IFOOD_CLIENT_ID environment variable is not set");
  });
});

describe("getIFoodClientSecret", () => {
  const originalEnv = process.env.IFOOD_CLIENT_SECRET;

  afterEach(() => {
    process.env.IFOOD_CLIENT_SECRET = originalEnv;
  });

  it("should return the value when set", () => {
    process.env.IFOOD_CLIENT_SECRET = "my-secret";

    expect(getIFoodClientSecret()).toBe("my-secret");
  });

  it("should throw when not set", () => {
    delete process.env.IFOOD_CLIENT_SECRET;

    expect(() => getIFoodClientSecret()).toThrow("IFOOD_CLIENT_SECRET environment variable is not set");
  });
});
