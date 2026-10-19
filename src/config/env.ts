import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env variables into process.env before parsing
dotenv.config();

/**
 * Strict Environment Configuration Schema.
 * Fails fast on application boot if critical secrets or parameters are missing or invalid.
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z
      .string()
      .regex(/^\d+$/, { message: 'PORT must be a numeric string' })
      .transform(Number)
      .default('3000'),
    CORS_ORIGIN: z.string().default('*'),

    // Security & Rate Limiting Defaults
    RATE_LIMIT_WINDOW_MS: z
      .string()
      .regex(/^\d+$/, { message: 'RATE_LIMIT_WINDOW_MS must be numeric' })
      .transform(Number)
      .default('900000'), // 15 minutes default
    RATE_LIMIT_MAX_REQUESTS: z
      .string()
      .regex(/^\d+$/, { message: 'RATE_LIMIT_MAX_REQUESTS must be numeric' })
      .transform(Number)
      .default('100'),

    // Google Gemini AI Configuration
    GEMINI_API_KEY: z
      .string({
        required_error: 'GEMINI_API_KEY is required for GenAI Event Planning capabilities.',
      })
      .min(10, { message: 'GEMINI_API_KEY appears too short to be valid.' })
      .refine(
        (key) => key !== 'your_gemini_api_key_here' && !key.includes('PLACEHOLDER'),
        { message: 'GEMINI_API_KEY must not be a placeholder value.' }
      ),
    GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  });

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Parses and returns strictly validated environment configuration.
 * Throws a formatted Error terminating execution if configuration invariants fail.
 */
function loadAndValidateEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    const message = [
      'FATAL CONFIGURATION ERROR: Invalid environment configuration detected.',
      'Application bootstrap aborted to prevent unsafe runtime execution.',
      errorDetails,
      'Ensure a valid .env file exists or set the variables in your environment.',
    ].join('\n');

    // Never leak actual secret values in logs or exception messages
    console.error(message);
    throw new Error(message);
  }

  return Object.freeze(result.data);
}

// Single instance export, evaluated safely on demand or startup
let _config: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!_config) {
    _config = loadAndValidateEnv();
  }
  return _config;
}

/**
 * For test fixtures only: permits resetting the cached config when testing env validation
 */
export function resetEnvCache(): void {
  _config = null;
}
