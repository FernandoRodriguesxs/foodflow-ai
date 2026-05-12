import { and, eq, isNull, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { conversations } from "@database/schemas/conversations.schema";
import type { StoreId } from "@shared/value-objects/store-id";
import type { WhatsAppNumber } from "@whatsapp/value-objects/whatsapp-number";
import type { ConversationMessageRecord } from "./whatsapp.types";

export async function findActiveConversation(
  database: NeonHttpDatabase,
  storeId: StoreId,
  sender: WhatsAppNumber,
): Promise<{ id: string } | undefined> {
  const rows = await database
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.storeId, storeId.value),
        eq(conversations.whatsappNumber, sender.value),
        isNull(conversations.orderId),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function appendMessageToConversation(
  database: NeonHttpDatabase,
  conversationId: string,
  record: ConversationMessageRecord,
): Promise<void> {
  const serialized = JSON.stringify([record]);
  await database
    .update(conversations)
    .set({
      messages: sql`${conversations.messages} || ${serialized}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));
}

export async function createConversationWithMessage(
  database: NeonHttpDatabase,
  storeId: StoreId,
  sender: WhatsAppNumber,
  record: ConversationMessageRecord,
): Promise<string> {
  const [row] = await database
    .insert(conversations)
    .values({
      storeId: storeId.value,
      whatsappNumber: sender.value,
      messages: [record],
    })
    .returning({ id: conversations.id });
  return row.id;
}
