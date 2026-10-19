/**
 * Base abstract class for all domain-specific errors.
 * Ensures consistent error classification across Clean Architecture layers.
 */
export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Thrown when an entity or resource is not found in the persistence layer.
 */
export class EntityNotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly errorCode = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, id: string) {
    super(`${entityName} with identifier "${id}" was not found.`);
  }
}

/**
 * Thrown when incoming payload fails domain validation or sanitization constraints.
 */
export class ValidationError extends DomainError {
  public readonly statusCode = 400;
  public readonly errorCode = 'VALIDATION_ERROR';
  public readonly details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message);
    this.details = details;
  }
}

/**
 * Thrown when a business invariant is violated (e.g. allocated budget exceeds limit).
 */
export class BusinessRuleViolationError extends DomainError {
  public readonly statusCode = 422;
  public readonly errorCode = 'BUSINESS_RULE_VIOLATION';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when rate limit window threshold has been exceeded.
 */
export class RateLimitExceededError extends DomainError {
  public readonly statusCode = 429;
  public readonly errorCode = 'RATE_LIMIT_EXCEEDED';

  constructor(message = 'Too many requests. Please try again later.') {
    super(message);
  }
}

/**
 * Thrown when external AI service configuration or inference fails safely.
 */
export class ExternalServiceError extends DomainError {
  public readonly statusCode = 502;
  public readonly errorCode = 'EXTERNAL_SERVICE_ERROR';

  constructor(serviceName: string, message: string) {
    super(`External service "${serviceName}" failure: ${message}`);
  }
}
