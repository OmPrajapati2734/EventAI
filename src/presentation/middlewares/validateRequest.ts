import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { sanitizeInput } from '../../infrastructure/security/sanitizer.js';

type RequestTarget = 'body' | 'query' | 'params';

/**
 * Express middleware factory for strict schema validation.
 * Performs deep prototype pollution check and injection sanitization before Zod parsing.
 */
export function validateRequest(schema: ZodSchema, target: RequestTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const rawData = req[target];
      // 1. Sanitize against prototype pollution and malicious tags
      const sanitized = sanitizeInput(rawData);

      // 2. Strict Zod parse
      const parsed = schema.parse(sanitized);

      // 3. Assign sanitized, type-safe data back
      req[target] = parsed;

      next();
    } catch (error) {
      next(error);
    }
  };
}
