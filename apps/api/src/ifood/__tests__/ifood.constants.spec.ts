import { getRedisUrl, parseRedisConnection } from "../ifood.constants";

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
