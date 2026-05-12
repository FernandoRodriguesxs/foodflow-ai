import { BadRequestException } from "@nestjs/common";
import { ORDER_SOURCE_VALUES, ORDER_STATUS_VALUES } from "@database/schemas/enum-values";
import {
  ORDER_LIST_DEFAULT_LIMIT,
  ORDER_LIST_DEFAULT_PAGE,
  ORDER_LIST_MAX_LIMIT,
} from "./orders.constants";
import type {
  OrderListFilters,
  OrderListQueryInput,
} from "./order-list.types";
import type { OrderSource, StatusValue } from "./orders.types";

export function parseOrderListQuery(raw: OrderListQueryInput): OrderListFilters {
  return Object.freeze({
    statuses: parseStatusesCsv(raw.status),
    source: parseSource(raw.source),
    page: parsePositiveInteger(raw.page, ORDER_LIST_DEFAULT_PAGE, "page"),
    limit: parseLimit(raw.limit),
  });
}

function parseStatusesCsv(raw: string | undefined): readonly StatusValue[] {
  if (!raw) return [];
  return raw.split(",").map((value) => parseStatus(value.trim()));
}

function parseStatus(value: string): StatusValue {
  if (!ORDER_STATUS_VALUES.includes(value as StatusValue)) {
    throw new BadRequestException(`invalid status: ${value}`);
  }
  return value as StatusValue;
}

function parseSource(raw: string | undefined): OrderSource | undefined {
  if (!raw) return undefined;
  if (!ORDER_SOURCE_VALUES.includes(raw as OrderSource)) {
    throw new BadRequestException(`invalid source: ${raw}`);
  }
  return raw as OrderSource;
}

function parsePositiveInteger(raw: string | undefined, fallback: number, field: string): number {
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new BadRequestException(`${field} must be a positive integer`);
  }
  return value;
}

function parseLimit(raw: string | undefined): number {
  const value = parsePositiveInteger(raw, ORDER_LIST_DEFAULT_LIMIT, "limit");
  if (value > ORDER_LIST_MAX_LIMIT) {
    throw new BadRequestException(`limit must be at most ${ORDER_LIST_MAX_LIMIT}`);
  }
  return value;
}
