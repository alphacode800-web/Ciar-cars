export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
