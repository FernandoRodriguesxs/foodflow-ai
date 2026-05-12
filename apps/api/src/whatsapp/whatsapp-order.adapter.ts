import { randomUUID } from "node:crypto";
import type { StoreId } from "@shared/value-objects/store-id";
import type { CreateOrderItemData, RawOrderData } from "@orders/orders.types";
import type {
  ParsedWhatsAppItem,
  ParsedWhatsAppOrder,
} from "./whatsapp-nlp.types";
import type { IncomingWhatsAppMessage } from "./whatsapp.types";

const DEFAULT_CUSTOMER_NAME = "Cliente WhatsApp";
const ZERO_PRICE = 0;

export function buildWhatsAppRawOrder(
  storeId: StoreId,
  incoming: IncomingWhatsAppMessage,
  parsed: ParsedWhatsAppOrder,
): RawOrderData {
  return Object.freeze({
    storeId: storeId.value,
    externalId: `whatsapp:${randomUUID()}`,
    customerName: parsed.customerName ?? DEFAULT_CUSTOMER_NAME,
    customerPhone: incoming.senderWhatsApp.value,
    total: ZERO_PRICE,
    items: parsed.items.map(toCreateOrderItem),
    rawData: incoming.raw,
  });
}

function toCreateOrderItem(item: ParsedWhatsAppItem): CreateOrderItemData {
  return Object.freeze({
    name: item.name,
    quantity: item.quantity,
    unitPrice: ZERO_PRICE,
    notes: item.notes,
  });
}
