/**
 * API レスポンスの基本型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ページネーション情報
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

/**
 * 成功レスポンスを作成
 */
export function createApiResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(
  error: string,
  message?: string
): ErrorResponse {
  return {
    success: false,
    error,
    ...(message && { message }),
  };
}

/**
 * ページネーション付きレスポンスを作成
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * リクエストバリデーション
 */
export function validateRequest<T>(
  body: unknown,
  schema: (value: unknown) => value is T
): { isValid: true; data: T } | { isValid: false; error: string } {
  if (!schema(body)) {
    return {
      isValid: false,
      error: 'Invalid request body',
    };
  }
  return {
    isValid: true,
    data: body,
  };
}

/**
 * ページネーションパラメータを取得
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
