import { WhatsAppOrderProcessor } from "../whatsapp-order.processor";
import type { WhatsAppNlpService } from "../whatsapp-nlp.service";
import type { OrderNormalizerService } from "@orders/order-normalizer.service";
import type { ConversationRepository } from "../conversation.repository";
import type { ParsedWhatsAppOrder } from "../whatsapp-nlp.types";
import {
  FAKE_CONVERSATION_ID,
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_ID,
  FAKE_STORE_ID_VO,
  createFakeIncomingMessage,
} from "./fixtures";

function buildParsedOrder(isOrder: boolean): ParsedWhatsAppOrder {
  return Object.freeze({
    isOrder,
    items: isOrder ? [{ name: "pizza", quantity: 1 }] : [],
    customerName: undefined,
    notes: undefined,
  });
}

describe("WhatsAppOrderProcessor", () => {
  const mockNlp = {
    extractOrder: jest.fn(),
  } as unknown as jest.Mocked<WhatsAppNlpService>;

  const mockNormalizer = {
    normalizeWhatsAppOrder: jest.fn().mockResolvedValue({
      id: "order-uuid-001",
      storeId: FAKE_STORE_ID,
    }),
  } as unknown as jest.Mocked<OrderNormalizerService>;

  const mockRepository = {
    linkOrder: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<ConversationRepository>;

  const processor = new WhatsAppOrderProcessor(mockNlp, mockNormalizer, mockRepository);

  afterEach(() => jest.clearAllMocks());

  it("should skip normalization and link when NLP classifies as non-order", async () => {
    mockNlp.extractOrder.mockResolvedValueOnce(buildParsedOrder(false));

    await processor.processIfOrder(FAKE_STORE_ID_VO, FAKE_CONVERSATION_ID, createFakeIncomingMessage());

    expect(mockNormalizer.normalizeWhatsAppOrder).not.toHaveBeenCalled();
    expect(mockRepository.linkOrder).not.toHaveBeenCalled();
  });

  it("should normalize order and link conversation when NLP detects an order", async () => {
    mockNlp.extractOrder.mockResolvedValueOnce(buildParsedOrder(true));
    const incoming = createFakeIncomingMessage();

    await processor.processIfOrder(FAKE_STORE_ID_VO, FAKE_CONVERSATION_ID, incoming);

    expect(mockNormalizer.normalizeWhatsAppOrder).toHaveBeenCalledTimes(1);
    const rawOrder = mockNormalizer.normalizeWhatsAppOrder.mock.calls[0][0];
    expect(rawOrder.storeId).toBe(FAKE_STORE_ID);
    expect(rawOrder.customerPhone).toBe(FAKE_SENDER_WHATSAPP);
    expect(mockRepository.linkOrder).toHaveBeenCalledWith(
      FAKE_STORE_ID_VO,
      FAKE_CONVERSATION_ID,
      "order-uuid-001",
    );
  });

  it("should propagate NLP errors without invoking normalizer", async () => {
    mockNlp.extractOrder.mockRejectedValueOnce(new Error("nlp down"));

    await expect(
      processor.processIfOrder(FAKE_STORE_ID_VO, FAKE_CONVERSATION_ID, createFakeIncomingMessage()),
    ).rejects.toThrow("nlp down");
    expect(mockNormalizer.normalizeWhatsAppOrder).not.toHaveBeenCalled();
  });

  it("should propagate normalizer errors without linking conversation", async () => {
    mockNlp.extractOrder.mockResolvedValueOnce(buildParsedOrder(true));
    mockNormalizer.normalizeWhatsAppOrder.mockRejectedValueOnce(new Error("db fail"));

    await expect(
      processor.processIfOrder(FAKE_STORE_ID_VO, FAKE_CONVERSATION_ID, createFakeIncomingMessage()),
    ).rejects.toThrow("db fail");
    expect(mockRepository.linkOrder).not.toHaveBeenCalled();
  });
});
