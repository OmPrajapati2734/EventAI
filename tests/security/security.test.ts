import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInput, isSafeObject } from '../../src/infrastructure/security/sanitizer.js';
import { InMemoryRateLimiter } from '../../src/infrastructure/security/rateLimiter.js';
import { errorHandler } from '../../src/infrastructure/security/errorHandler.js';
import { RateLimitExceededError } from '../../src/domain/errors/DomainErrors.js';
import type { Request, Response } from 'express';

test('Security Sanitizer: Blocks prototype pollution attempts', () => {
  // Test 1: Object with __proto__ key
  const maliciousPayload1 = JSON.parse('{"title":"Summer Festival","__proto__":{"polluted":true}}');
  assert.throws(() => {
    sanitizeInput(maliciousPayload1);
  }, /Prototype pollution attempt detected/);

  // Test 2: Nested constructor pollution
  const maliciousPayload2 = JSON.parse('{"event":{"constructor":{"polluted":true}}}');
  assert.throws(() => {
    sanitizeInput(maliciousPayload2);
  }, /Prototype pollution attempt detected/);

  // Test 3: isSafeObject utility correctly spots prototype key
  const unsafe = JSON.parse('{"__proto__":{"isAdmin":true}}');
  assert.equal(isSafeObject(unsafe), false);
  assert.equal(isSafeObject({ normal: 'value', number: 42 }), true);
});

test('Security Sanitizer: Neutralizes XSS angle brackets and null bytes', () => {
  const dirty = {
    title: '  <script>alert("xss")</script>Charity Gala  ',
    notes: 'Hello\0World',
  };

  const clean = sanitizeInput(dirty);
  assert.equal(clean.title, '&lt;script&gt;alert("xss")&lt;/script&gt;Charity Gala');
  assert.equal(clean.notes, 'HelloWorld');
});

test('Security Rate Limiter: Enforces limits and sends RFC headers', () => {
  const limiter = new InMemoryRateLimiter({
    windowMs: 60000,
    maxRequests: 3,
    keyGenerator: () => 'test-ip-127.0.0.1',
  });

  const headers: Record<string, any> = {};
  const mockRes = {
    setHeader: (name: string, value: any) => {
      headers[name] = value;
    },
  } as unknown as Response;

  const mockReq = {} as Request;

  let nextCalledWith: any = null;
  const middleware = limiter.middleware();

  // Request 1: allowed
  middleware(mockReq, mockRes, (err) => {
    nextCalledWith = err;
  });
  assert.equal(nextCalledWith, undefined);
  assert.equal(headers['X-RateLimit-Limit'], 3);
  assert.equal(headers['X-RateLimit-Remaining'], 2);

  // Request 2: allowed
  middleware(mockReq, mockRes, (err) => {
    nextCalledWith = err;
  });
  assert.equal(nextCalledWith, undefined);
  assert.equal(headers['X-RateLimit-Remaining'], 1);

  // Request 3: allowed
  middleware(mockReq, mockRes, (err) => {
    nextCalledWith = err;
  });
  assert.equal(nextCalledWith, undefined);
  assert.equal(headers['X-RateLimit-Remaining'], 0);

  // Request 4: rejected with RateLimitExceededError
  middleware(mockReq, mockRes, (err) => {
    nextCalledWith = err;
  });
  assert.ok((nextCalledWith as unknown) instanceof RateLimitExceededError);
  assert.ok(headers['Retry-After'] >= 0);

  limiter.destroy();
});

test('Security Error Handler: Shields internal stack traces and handles domain errors', () => {
  const originalEnv = process.env['NODE_ENV'];
  process.env['NODE_ENV'] = 'production';

  let responseStatus = 0;
  let responseBody: any = null;

  const mockRes = {
    status: (code: number) => {
      responseStatus = code;
      return mockRes;
    },
    json: (body: any) => {
      responseBody = body;
      return mockRes;
    },
  } as unknown as Response;

  const mockReq = {
    headers: { 'x-request-id': 'req-xyz-789' },
    method: 'POST',
    originalUrl: '/api/v1/event-plans',
  } as unknown as Request;

  // Unhandled error in production must NOT reveal error.stack
  const unexpectedError = new Error('Database password was incorrect in connection string at line 42');
  errorHandler(unexpectedError, mockReq, mockRes, () => {});

  assert.equal(responseStatus, 500);
  assert.equal(responseBody.success, false);
  assert.equal(responseBody.error.code, 'INTERNAL_SERVER_ERROR');
  assert.equal(responseBody.error.message, 'An unexpected error occurred while processing your request. Please contact support.');
  assert.equal(responseBody.stack, undefined);
  assert.equal(responseBody.requestId, 'req-xyz-789');

  process.env['NODE_ENV'] = originalEnv;
});
