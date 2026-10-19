import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../domain/errors/DomainErrors.js';

interface ErrorResponsePayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Defensive error handling middleware.
 * Guarantees zero stack trace exposure and unified API problem output.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProd = process.env['NODE_ENV'] === 'production';
  const timestamp = new Date().toISOString();
  const requestId = (req.headers['x-request-id'] as string) || undefined;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload format or parameters.',
        details: formattedIssues,
      },
      timestamp,
      requestId,
    } satisfies ErrorResponsePayload);
    return;
  }

  // 2. Custom Domain Errors (Clean Architecture Business Invariants)
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: 'details' in err ? (err as Record<string, unknown>)['details'] : undefined,
      },
      timestamp,
      requestId,
    } satisfies ErrorResponsePayload);
    return;
  }

  // 3. JSON Syntax Parsing Errors from body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as Record<string, unknown>)['status'] === 400) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Malformed JSON payload received.',
      },
      timestamp,
      requestId,
    } satisfies ErrorResponsePayload);
    return;
  }

  // 4. Fallback for unhandled/internal server exceptions
  // Log full error internally for observability, but NEVER leak stack trace to client
  console.error(`[UnhandledException] ${timestamp} - Path: ${req.method} ${req.originalUrl}:`, err);

  const safeErrorMessage = isProd
    ? 'An unexpected error occurred while processing your request. Please contact support.'
    : err instanceof Error
      ? err.message
      : 'Internal Server Error';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: safeErrorMessage,
    },
    timestamp,
    requestId,
  } satisfies ErrorResponsePayload);
};
