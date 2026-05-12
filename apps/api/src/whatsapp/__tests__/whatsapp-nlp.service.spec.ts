import type Anthropic from "@anthropic-ai/sdk";
import { WhatsAppNlpService } from "../whatsapp-nlp.service";
import { MessageContent } from "../value-objects/message-content";
import {
  CLAUDE_HAIKU_MODEL,
  NLP_MAX_TOKENS,
  NLP_TEMPERATURE,
} from "../whatsapp-nlp.constants";
import { NLP_SYSTEM_PROMPT } from "../whatsapp-nlp.prompt";

function buildTextResponse(text: string): Anthropic.Message {
  return { content: [{ type: "text", text }] } as Anthropic.Message;
}

function buildClient(messageImpl: jest.Mock): Anthropic {
  return { messages: { create: messageImpl } } as unknown as Anthropic;
}

describe("WhatsAppNlpService", () => {
  const validResponse = JSON.stringify({
    is_order: true,
    items: [
      { name: "pizza margherita", quantity: 2 },
      { name: "coca-cola", quantity: 1, notes: "lata" },
    ],
    customer_name: "Maria",
    notes: "entregar 20h",
  });

  it("should call Claude Haiku with the configured model and prompt", async () => {
    const create = jest.fn().mockResolvedValue(buildTextResponse(validResponse));
    const service = new WhatsAppNlpService(buildClient(create));
    const message = MessageContent.create("2 pizzas margherita e 1 coca");

    await service.extractOrder(message);

    expect(create).toHaveBeenCalledWith({
      model: CLAUDE_HAIKU_MODEL,
      max_tokens: NLP_MAX_TOKENS,
      temperature: NLP_TEMPERATURE,
      system: NLP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: "2 pizzas margherita e 1 coca" }],
    });
  });

  it("should return a frozen parsed order with items, customer name and notes", async () => {
    const create = jest.fn().mockResolvedValue(buildTextResponse(validResponse));
    const service = new WhatsAppNlpService(buildClient(create));

    const parsed = await service.extractOrder(MessageContent.create("qualquer"));

    expect(parsed.isOrder).toBe(true);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0]).toEqual({ name: "pizza margherita", quantity: 2, notes: undefined });
    expect(parsed.items[1]).toEqual({ name: "coca-cola", quantity: 1, notes: "lata" });
    expect(parsed.customerName).toBe("Maria");
    expect(parsed.notes).toBe("entregar 20h");
    expect(Object.isFrozen(parsed)).toBe(true);
  });

  it("should return is_order false with empty items when Claude classifies as non-order", async () => {
    const create = jest.fn().mockResolvedValue(
      buildTextResponse(JSON.stringify({ is_order: false, items: [] })),
    );
    const service = new WhatsAppNlpService(buildClient(create));

    const parsed = await service.extractOrder(MessageContent.create("oi tudo bem?"));

    expect(parsed.isOrder).toBe(false);
    expect(parsed.items).toEqual([]);
  });

  it("should throw when Claude returns non-text content", async () => {
    const create = jest.fn().mockResolvedValue({ content: [] } as unknown as Anthropic.Message);
    const service = new WhatsAppNlpService(buildClient(create));

    await expect(service.extractOrder(MessageContent.create("x"))).rejects.toThrow(
      /text content/,
    );
  });

  it("should throw when Claude response is not valid JSON", async () => {
    const create = jest.fn().mockResolvedValue(buildTextResponse("not a json"));
    const service = new WhatsAppNlpService(buildClient(create));

    await expect(service.extractOrder(MessageContent.create("x"))).rejects.toThrow(
      /valid JSON/,
    );
  });

  it("should throw when JSON does not match schema (negative quantity)", async () => {
    const create = jest.fn().mockResolvedValue(
      buildTextResponse(JSON.stringify({ is_order: true, items: [{ name: "x", quantity: -1 }] })),
    );
    const service = new WhatsAppNlpService(buildClient(create));

    await expect(service.extractOrder(MessageContent.create("x"))).rejects.toThrow();
  });

  it("should propagate errors raised by the SDK", async () => {
    const create = jest.fn().mockRejectedValue(new Error("api down"));
    const service = new WhatsAppNlpService(buildClient(create));

    await expect(service.extractOrder(MessageContent.create("x"))).rejects.toThrow("api down");
  });
});
