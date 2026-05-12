import type Anthropic from "@anthropic-ai/sdk";
import { parsedOrderResponseSchema } from "./whatsapp-nlp.schema";
import { NLP_SYSTEM_PROMPT } from "./whatsapp-nlp.prompt";
import {
  CLAUDE_HAIKU_MODEL,
  NLP_MAX_TOKENS,
  NLP_TEMPERATURE,
} from "./whatsapp-nlp.constants";
import type {
  ParsedWhatsAppItem,
  ParsedWhatsAppOrder,
} from "./whatsapp-nlp.types";

const INVALID_RESPONSE_TEXT = "Claude returned a response without text content";
const INVALID_JSON_TEXT = "Claude response is not valid JSON";

export async function requestOrderExtraction(
  client: Anthropic,
  userMessage: string,
): Promise<string> {
  const response = await client.messages.create({
    model: CLAUDE_HAIKU_MODEL,
    max_tokens: NLP_MAX_TOKENS,
    temperature: NLP_TEMPERATURE,
    system: NLP_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
  return extractText(response);
}

function extractText(response: Anthropic.Message): string {
  const block = response.content.find((part) => part.type === "text");
  if (!block || block.type !== "text") {
    throw new Error(INVALID_RESPONSE_TEXT);
  }
  return block.text;
}

export function parseJsonResponse(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error(INVALID_JSON_TEXT);
  }
}

export function toParsedOrder(rawText: string): ParsedWhatsAppOrder {
  const validated = parsedOrderResponseSchema.parse(parseJsonResponse(rawText));
  return Object.freeze({
    isOrder: validated.is_order,
    items: validated.items.map(toParsedItem),
    customerName: validated.customer_name,
    notes: validated.notes,
  });
}

function toParsedItem(item: { name: string; quantity: number; notes?: string }): ParsedWhatsAppItem {
  return Object.freeze({
    name: item.name,
    quantity: item.quantity,
    notes: item.notes,
  });
}
