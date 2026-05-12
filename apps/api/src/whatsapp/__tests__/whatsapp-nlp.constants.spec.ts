import { getAnthropicApiKey } from "../whatsapp-nlp.constants";

describe("getAnthropicApiKey", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
      return;
    }
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it("should return the env var value when set", () => {
    process.env.ANTHROPIC_API_KEY = "sk-test-123";

    expect(getAnthropicApiKey()).toBe("sk-test-123");
  });

  it("should throw when the env var is not set", () => {
    delete process.env.ANTHROPIC_API_KEY;

    expect(() => getAnthropicApiKey()).toThrow(/ANTHROPIC_API_KEY/);
  });
});
