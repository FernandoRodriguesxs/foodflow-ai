import { Injectable } from "@nestjs/common";
import { IFoodHttpClient } from "./ifood-http-client";
import { IFOOD_ORDER_PATH } from "./ifood.constants";
import type { IFoodOrderId } from "./value-objects/ifood-order-id";
import type { IFoodOrderDetails } from "./ifood.types";

@Injectable()
export class IFoodOrderClient {
  constructor(private readonly httpClient: IFoodHttpClient) {}

  async fetchOrderDetails(orderId: IFoodOrderId): Promise<IFoodOrderDetails> {
    const response = await this.httpClient.authenticatedGet(
      `${IFOOD_ORDER_PATH}/${orderId.value}`,
    );
    return response.json();
  }
}
