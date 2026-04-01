import type { StoreId } from "@ifood/value-objects/store-id";
import type {
  IFoodOrderDetails,
  IFoodOrderItem,
  NormalizedIFoodOrder,
  NormalizedIFoodOrderItem,
} from "./ifood.types";

export function extractNormalizedOrder(
  storeId: StoreId,
  orderDetails: IFoodOrderDetails,
): NormalizedIFoodOrder {
  return Object.freeze({
    storeId: storeId.value,
    externalId: orderDetails.id,
    customerName: orderDetails.customer.name,
    customerPhone: orderDetails.customer.phone.number,
    total: orderDetails.totalPrice,
    items: extractItems(orderDetails.items),
    rawData: orderDetails,
  });
}

function extractItems(
  items: ReadonlyArray<IFoodOrderItem>,
): ReadonlyArray<NormalizedIFoodOrderItem> {
  return items.map(extractSingleItem);
}

function extractSingleItem(item: IFoodOrderItem): NormalizedIFoodOrderItem {
  return Object.freeze({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    notes: item.observations,
  });
}
