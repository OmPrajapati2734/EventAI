import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { getEnv } from './config/env.js';
import { InMemoryRateLimiter } from './infrastructure/security/rateLimiter.js';
import { errorHandler } from './infrastructure/security/errorHandler.js';
import { createHealthRouter } from './presentation/routes/health.routes.js';
import { createEventPlanRouter } from './presentation/routes/eventPlan.routes.js';
import { EventPlanController } from './presentation/controllers/EventPlanController.js';
import { CreateEventPlanUseCase } from './application/use-cases/CreateEventPlanUseCase.js';
import { GetEventPlanUseCase } from './application/use-cases/GetEventPlanUseCase.js';
import { AddBudgetItemUseCase } from './application/use-cases/AddBudgetItemUseCase.js';
import { GenerateThemeIdeasUseCase } from './application/use-cases/GenerateThemeIdeasUseCase.js';
import type { IEventPlanRepository } from './domain/repositories/IEventPlanRepository.js';
import type { IAIService } from './application/ports/IAIService.js';
import { InMemoryEventPlanRepository } from './infrastructure/repositories/InMemoryEventPlanRepository.js';
import { GeminiAiService } from './infrastructure/ai/GeminiAiService.js';
import { GeminiEventPlannerService } from './infrastructure/ai/GeminiEventPlannerService.js';
import type { IEventPlannerService } from './domain/services/IEventPlannerService.js';
import { GenerateFullPlanUseCase } from './application/use-cases/GenerateFullPlanUseCase.js';

export interface AppDependencies {
  repository?: IEventPlanRepository;
  aiService?: IAIService;
  plannerService?: IEventPlannerService;
  rateLimiter?: InMemoryRateLimiter;
}

/**
 * Express Application Factory.
 * Assembles clean architecture dependencies, security middlewares, and routing.
 */
export function createApp(dependencies: AppDependencies = {}): {
  app: Application;
  repository: IEventPlanRepository;
  plannerService: IEventPlannerService;
  rateLimiter: InMemoryRateLimiter;
} {
  const env = getEnv();
  const app = express();

  // 1. Core Persistence and AI Adapters (Defaults to In-Memory & Gemini GenAI)
  const repository = dependencies.repository ?? new InMemoryEventPlanRepository();
  const aiService = dependencies.aiService ?? new GeminiAiService();
  const plannerService = dependencies.plannerService ?? new GeminiEventPlannerService();
  const rateLimiter =
    dependencies.rateLimiter ??
    new InMemoryRateLimiter({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    });

  // 2. Harden Security Headers (OWASP Recommended)
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline';"
    );
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // 3. CORS Configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      credentials: true,
      maxAge: 86400,
    })
  );

  // 4. Rate Limiting Middleware
  app.use(rateLimiter.middleware());

  // 5. Body Parsing with Payload Size Hardening
  app.use(express.json({ limit: '100kb' }));

  // 6. Application Use-Cases Initialization
  const createUseCase = new CreateEventPlanUseCase(repository);
  const getUseCase = new GetEventPlanUseCase(repository);
  const addBudgetItemUseCase = new AddBudgetItemUseCase(repository);
  const generateThemeUseCase = new GenerateThemeIdeasUseCase(repository, aiService);
  const generateFullPlanUseCase = new GenerateFullPlanUseCase(repository, plannerService);

  // 7. Presentation Layer Controllers & Routes
  const eventPlanController = new EventPlanController(
    createUseCase,
    getUseCase,
    addBudgetItemUseCase,
    generateThemeUseCase,
    repository,
    generateFullPlanUseCase
  );

  app.use('/api/v1/health', createHealthRouter());
  app.use('/api/v1/event-plans', createEventPlanRouter(eventPlanController));

  // 8. 404 Handler for Unmatched Endpoints
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.path} not found.`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 9. Central Defensive Error Handler
  app.use(errorHandler);

  return { app, repository, plannerService, rateLimiter };
}
