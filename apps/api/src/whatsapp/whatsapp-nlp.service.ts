import { Inject, Injectable } from "@nestjs/common";
import type Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_CLIENT_TOKEN } from "./whatsapp-nlp.constants";
import { requestOrderExtraction, toParsedOrder } from "./whatsapp-nlp.helpers";
import type { MessageContent } from "@whatsapp/value-objects/message-content";
import type { ParsedWhatsAppOrder } from "./whatsapp-nlp.types";

@Injectable()
export class WhatsAppNlpService {
  constructor(
    @Inject(ANTHROPIC_CLIENT_TOKEN) private readonly anthropic: Anthropic,
  ) {}

  async extractOrder(message: MessageContent): Promise<ParsedWhatsAppOrder> {
    const rawText = await requestOrderExtraction(this.anthropic, message.value);
    return toParsedOrder(rawText);
  }
}
