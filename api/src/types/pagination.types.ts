/** Mirrors mobile/src/types/api.types.ts's PaginatedResponse<T> exactly. */
export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type PaginationQuery = {
  page: number;
  limit: number;
};
