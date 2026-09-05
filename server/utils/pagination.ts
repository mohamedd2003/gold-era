import type { Meta } from "./ApiResponse";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Normalises pagination query params with sane bounds.
 */
export function getPagination(
  query: Record<string, unknown>,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): PaginationParams {
  const { page: defPage = 1, limit: defLimit = 10, maxLimit = 100 } = defaults;

  let page = Number.parseInt(String(query.page ?? defPage), 10);
  let limit = Number.parseInt(String(query.limit ?? defLimit), 10);

  if (!Number.isFinite(page) || page < 1) page = defPage;
  if (!Number.isFinite(limit) || limit < 1) limit = defLimit;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(
  total: number,
  { page, limit }: PaginationParams
): Meta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
