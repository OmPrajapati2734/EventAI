/**
 * Prototype pollution protection keys that must never appear in raw JSON payloads.
 */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Deeply inspects and sanitizes an unknown data structure to prevent:
 * 1. Prototype Pollution attacks
 * 2. Unsanitized dangerous HTML control characters (<, >)
 * 3. Null-byte injection attacks (\0)
 */
export function sanitizeInput<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // Strip null bytes and normalize whitespace
    let sanitized = input.replace(/\0/g, '').trim();
    // Neutralize dangerous angle brackets to prevent stored XSS
    sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return sanitized as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    // If it's a Date, RegExp, or Buffer, return as-is
    if (input instanceof Date || input instanceof RegExp) {
      return input;
    }

    const cleanObj: Record<string, unknown> = Object.create(null);

    for (const [key, value] of Object.entries(input)) {
      if (FORBIDDEN_KEYS.has(key)) {
        throw new Error(`Prototype pollution attempt detected with key "${key}". Request rejected.`);
      }

      // Check if key itself contains null bytes or malicious patterns
      if (key.includes('\0') || key.includes('__proto__')) {
        throw new Error('Malicious object key structure detected.');
      }

      cleanObj[key] = sanitizeInput(value);
    }

    return cleanObj as T;
  }

  return input;
}

/**
 * Strict validator to verify that an object is free of prototype pollution traits.
 */
export function isSafeObject(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') {
    return true;
  }

  const stack: unknown[] = [obj];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;

    for (const key of Object.getOwnPropertyNames(current)) {
      if (FORBIDDEN_KEYS.has(key)) {
        return false;
      }
      const val = (current as Record<string, unknown>)[key];
      if (val && typeof val === 'object') {
        stack.push(val);
      }
    }
  }

  return true;
}
