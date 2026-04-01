import { orders } from "@database/schemas/orders.schema";

export type CreatedOrder = typeof orders.$inferSelect;

export type OrderSource = "ifood" | "whatsapp";

export interface RawOrderData {
  readonly storeId: string;
  readonly externalId: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly total: number;
  readonly items: ReadonlyArray<CreateOrderItemData>;
  readonly rawData: unknown;
}

export interface CreateOrderData extends RawOrderData {
  readonly source: OrderSource;
}

export interface CreateOrderItemData {
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly notes?: string;
}
