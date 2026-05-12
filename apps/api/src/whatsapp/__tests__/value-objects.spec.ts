import { WhatsAppNumber } from "../value-objects/whatsapp-number";
import { MessageContent } from "../value-objects/message-content";

describe("WhatsAppNumber", () => {
  it("should create a value object trimming whitespace", () => {
    const number = WhatsAppNumber.create("  5511999998888  ");
    expect(number.value).toBe("5511999998888");
  });

  it("should reject an empty string", () => {
    expect(() => WhatsAppNumber.create("")).toThrow(/non-empty/);
  });

  it("should reject a null-ish input", () => {
    expect(() => WhatsAppNumber.create(undefined as unknown as string)).toThrow(/non-empty/);
  });

  it("should reject numbers longer than the 20 char schema limit", () => {
    expect(() => WhatsAppNumber.create("1".repeat(21))).toThrow(/maximum length/);
  });

  it("should extract the number from a remote JID", () => {
    const number = WhatsAppNumber.fromRemoteJid("5511999998888@s.whatsapp.net");
    expect(number.value).toBe("5511999998888");
  });

  it("should accept a remote JID without domain suffix", () => {
    const number = WhatsAppNumber.fromRemoteJid("5511999998888");
    expect(number.value).toBe("5511999998888");
  });

  it("should be frozen after construction", () => {
    const number = WhatsAppNumber.create("5511999998888");
    expect(Object.isFrozen(number)).toBe(true);
  });
});

describe("MessageContent", () => {
  it("should create content trimming whitespace", () => {
    const content = MessageContent.create("  hello world  ");
    expect(content.value).toBe("hello world");
  });

  it("should reject empty content", () => {
    expect(() => MessageContent.create("   ")).toThrow(/non-empty/);
  });

  it("should reject null-ish content", () => {
    expect(() => MessageContent.create(null as unknown as string)).toThrow(/non-empty/);
  });

  it("should be frozen after construction", () => {
    const content = MessageContent.create("hi");
    expect(Object.isFrozen(content)).toBe(true);
  });
});
