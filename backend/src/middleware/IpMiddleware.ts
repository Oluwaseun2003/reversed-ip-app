import type { Request, Response, NextFunction } from 'express';
import type { APIError } from '../types/index';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handler middleware
 * Must be the last middleware in the chain
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    code = 'CAST_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
    code = 'UNAUTHORIZED';
  } else if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = 'CORS policy violation';
    code = 'CORS_ERROR';
  }

  // Prepare error response
  const errorResponse: APIError = {
    success: false,
    error: {
      message,
      code,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      ...errorResponse.error.details,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: APIError = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
      details: {
        method: req.method,
        url: req.originalUrl,
        availableRoutes: [
          'GET /health',
          'POST /api/ip/reverse',
          'GET /api/ip/history',
          'GET /api/ip/stats',
          'GET /api/ip/search',
          'GET /api/ip/my-ip',
        ],
      },
    },
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = <T extends Request = Request, U extends Response = Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
): ((req: T, res: U, next: NextFunction) => void) => {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request timeout middleware
 */
export const timeoutHandler = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      if (!res.headersSent) {
        const error: APIError = {
          success: false,
          error: {
            message: 'Request timeout',
            code: 'REQUEST_TIMEOUT',
          },
          timestamp: new Date().toISOString(),
        };
        res.status(408).json(error);
      }
    }, timeout);

    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
};

/**
 * Rate limiting error handler
 */
export const rateLimitHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: APIError = {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      details: {
        retryAfter: res.get('Retry-After') || 60,
      },
    },
    timestamp: new Date().toISOString(),
  };

  res.status(429).json(error);
};

export default errorHandler;