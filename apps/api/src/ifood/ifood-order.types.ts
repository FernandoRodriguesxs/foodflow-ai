export interface IFoodOrderCustomer {
  readonly id: string;
  readonly name: string;
  readonly phone: { readonly number: string };
}

export interface IFoodOrderItem {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly price: number;
  readonly observations?: string;
}

export interface IFoodOrderDetails {
  readonly id: string;
  readonly createdAt: string;
  readonly customer: IFoodOrderCustomer;
  readonly items: ReadonlyArray<IFoodOrderItem>;
  readonly totalPrice: number;
  readonly subTotal: number;
  readonly deliveryFee: number;
}

export interface NormalizedIFoodOrder {
  readonly storeId: string;
  readonly externalId: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly total: number;
  readonly items: ReadonlyArray<NormalizedIFoodOrderItem>;
  readonly rawData: IFoodOrderDetails;
}

export interface NormalizedIFoodOrderItem {
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly notes?: string;
}
