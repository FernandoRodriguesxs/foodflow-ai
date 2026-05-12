import type { CreatedOrder, OrderSource, StatusValue } from "./orders.types";

export interface OrderListFilters {
  readonly statuses: readonly StatusValue[];
  readonly source?: OrderSource;
  readonly page: number;
  readonly limit: number;
}

export interface OrderListMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface OrderListResult {
  readonly data: readonly CreatedOrder[];
  readonly meta: OrderListMeta;
}

export interface OrderListQueryInput {
  readonly status?: string;
  readonly source?: string;
  readonly page?: string;
  readonly limit?: string;
}

export interface OrderListPageData {
  readonly data: readonly CreatedOrder[];
  readonly total: number;
}
