export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly requestId: string | undefined;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: unknown = null,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export const isApiError = (err: unknown): err is ApiError => err instanceof ApiError;

export const errorMessage = (err: unknown): string => {
  if (isApiError(err)) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unexpected error occurred';
};
