export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};
