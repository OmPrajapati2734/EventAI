import { Router } from 'express';
import { EventPlanController } from '../controllers/EventPlanController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  CreateEventPlanRequestSchema,
  AddBudgetItemRequestSchema,
} from '../../domain/schemas/eventPlan.schema.js';
import { GenerateFullPlanRequestSchema } from '../../application/use-cases/GenerateFullPlanUseCase.js';

export function createEventPlanRouter(controller: EventPlanController): Router {
  const router = Router();

  // POST /api/v1/event-plans/ai-generate - Full GenAI celebration plan generation with Gemini
  router.post(
    '/ai-generate',
    validateRequest(GenerateFullPlanRequestSchema, 'body'),
    controller.generateFullPlan
  );

  // POST /api/v1/event-plans - Create a new event plan aggregate
  router.post(
    '/',
    validateRequest(CreateEventPlanRequestSchema, 'body'),
    controller.create
  );

  // GET /api/v1/event-plans - List all event plans or filter by eventType query
  router.get('/', controller.list);

  // GET /api/v1/event-plans/:id - Get specific event plan aggregate by ID
  router.get('/:id', controller.getById);

  // POST /api/v1/event-plans/:id/budget-items - Add budget line item to plan
  router.post(
    '/:id/budget-items',
    validateRequest(AddBudgetItemRequestSchema, 'body'),
    controller.addBudgetItem
  );

  // POST /api/v1/event-plans/:id/generate-themes - Trigger Gemini GenAI theme suggestions
  router.post('/:id/generate-themes', controller.generateThemes);

  return router;
}
