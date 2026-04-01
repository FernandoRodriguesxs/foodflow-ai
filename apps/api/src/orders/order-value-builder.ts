import type { CreateOrderData, CreateOrderItemData } from "./orders.types";

export function buildOrderValues(orderData: CreateOrderData) {
  return Object.freeze({
    storeId: orderData.storeId,
    externalId: orderData.externalId,
    source: orderData.source,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    total: String(orderData.total),
    rawData: orderData.rawData,
  });
}

export function buildItemValues(orderId: string, items: ReadonlyArray<CreateOrderItemData>) {
  return items.map((item) => ({
    orderId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: String(item.unitPrice),
    notes: item.notes,
  }));
}
